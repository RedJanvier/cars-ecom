import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
  Timestamp,
  serverTimestamp,
  WhereFilterOp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { db, storage } from './firebase'
import { Car, Inquiry, Settings, FilterState } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function docToRecord<T>(snap: DocumentSnapshot): T {
  if (!snap.exists()) throw new Error('Document not found')
  const data = snap.data()!
  // Convert Timestamps to ISO strings
  const converted: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    converted[key] = val instanceof Timestamp ? val.toDate().toISOString() : val
  }
  return { id: snap.id, ...converted } as T
}

// ─── Image Storage ───────────────────────────────────────────────────────────

export async function uploadCarImage(file: File, carId: string): Promise<string> {
  const path = `cars/${carId}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteCarImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch {
    // Ignore if already deleted
  }
}

// ─── Cars ────────────────────────────────────────────────────────────────────

export async function getCars(
  filters: FilterState = {},
  pageSize = 12,
  lastDoc?: DocumentSnapshot
): Promise<{ items: Car[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const constraints: QueryConstraint[] = []

  if (filters.brand) constraints.push(where('brand', '==', filters.brand))
  if (filters.condition) constraints.push(where('condition', '==', filters.condition))
  if (filters.fuel_type) constraints.push(where('fuel_type', '==', filters.fuel_type))
  if (filters.transmission) constraints.push(where('transmission', '==', filters.transmission))
  if (filters.body_type) constraints.push(where('body_type', '==', filters.body_type))
  if (filters.min_price) constraints.push(where('price', '>=', filters.min_price))
  if (filters.max_price) constraints.push(where('price', '<=', filters.max_price))
  if (filters.min_year) constraints.push(where('year', '>=', filters.min_year))
  if (filters.max_year) constraints.push(where('year', '<=', filters.max_year))

  // Sort
  const sortField = filters.sort?.replace('-', '') || 'createdAt'
  const sortDir = filters.sort?.startsWith('-') ? 'desc' : 'asc'
  const safeSortField = ['price', 'year', 'createdAt'].includes(sortField) ? sortField : 'createdAt'
  constraints.push(orderBy(safeSortField, sortDir === 'asc' ? 'asc' : 'desc'))
  constraints.push(limit(pageSize + 1))

  if (lastDoc) constraints.push(startAfter(lastDoc))

  const q = query(collection(db, 'cars'), ...constraints)
  const snap = await getDocs(q)

  const items = snap.docs.slice(0, pageSize).map(d => docToRecord<Car>(d))
  const newLastDoc = snap.docs[pageSize - 1] ?? null
  const hasMore = snap.docs.length > pageSize

  // Client-side search filter (Firestore doesn't support full-text)
  const filtered = filters.search
    ? items.filter(car =>
        car.title?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        car.brand?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        car.model?.toLowerCase().includes(filters.search!.toLowerCase())
      )
    : items

  return { items: filtered, lastDoc: newLastDoc, hasMore }
}

export async function getCarById(id: string): Promise<Car> {
  const snap = await getDoc(doc(db, 'cars', id))
  return docToRecord<Car>(snap)
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const q = query(collection(db, 'cars'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return docToRecord<Car>(snap.docs[0])
}

export async function getFeaturedCars(max = 6): Promise<Car[]> {
  const q = query(
    collection(db, 'cars'),
    where('featured', '==', true),
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => docToRecord<Car>(d))
}

export async function createCar(data: Omit<Car, 'id' | 'created' | 'updated'>): Promise<Car> {
  const ref = await addDoc(collection(db, 'cars'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const snap = await getDoc(ref)
  return docToRecord<Car>(snap)
}

export async function updateCar(id: string, data: Partial<Car>): Promise<void> {
  await updateDoc(doc(db, 'cars', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCar(id: string): Promise<void> {
  await deleteDoc(doc(db, 'cars', id))
}

export async function getAllCarsAdmin(searchTerm?: string, pageSize = 15, lastDoc?: DocumentSnapshot): Promise<{
  items: Car[]
  lastDoc: DocumentSnapshot | null
  hasMore: boolean
}> {
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1),
  ]
  if (lastDoc) constraints.push(startAfter(lastDoc))

  const q = query(collection(db, 'cars'), ...constraints)
  const snap = await getDocs(q)
  let items = snap.docs.slice(0, pageSize).map(d => docToRecord<Car>(d))

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    items = items.filter(c =>
      c.title?.toLowerCase().includes(term) ||
      c.brand?.toLowerCase().includes(term) ||
      c.model?.toLowerCase().includes(term)
    )
  }

  return {
    items,
    lastDoc: snap.docs[pageSize - 1] ?? null,
    hasMore: snap.docs.length > pageSize,
  }
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

export async function createInquiry(data: Omit<Inquiry, 'id' | 'created' | 'updated' | 'status'>): Promise<Inquiry> {
  const ref = await addDoc(collection(db, 'inquiries'), {
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
  })
  const snap = await getDoc(ref)
  return docToRecord<Inquiry>(snap)
}

export async function getInquiries(
  statusFilter?: string,
  pageSize = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ items: Inquiry[]; lastDoc: DocumentSnapshot | null; total: number }> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageSize + 1)]
  if (statusFilter && statusFilter !== 'all') {
    constraints.unshift(where('status', '==', statusFilter))
  }
  if (lastDoc) constraints.push(startAfter(lastDoc))

  const q = query(collection(db, 'inquiries'), ...constraints)
  const snap = await getDocs(q)
  const items = snap.docs.slice(0, pageSize).map(d => docToRecord<Inquiry>(d))

  // Total count (approximate — Firestore doesn't have cheap count with filters)
  const totalSnap = await getDocs(query(
    collection(db, 'inquiries'),
    ...(statusFilter && statusFilter !== 'all' ? [where('status', '==', statusFilter)] : [])
  ))

  return {
    items,
    lastDoc: snap.docs[pageSize - 1] ?? null,
    total: totalSnap.size,
  }
}

export async function updateInquiryStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, 'inquiries', id), { status })
}

export async function deleteInquiry(id: string): Promise<void> {
  await deleteDoc(doc(db, 'inquiries', id))
}

// ─── Settings ────────────────────────────────────────────────────────────────

const SETTINGS_DOC = 'main'

export async function getSettings(): Promise<Settings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Settings
  } catch {
    return null
  }
}

export async function saveSettings(data: Partial<Settings>): Promise<void> {
  const ref = doc(db, 'settings', SETTINGS_DOC)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  } else {
    await import('firebase/firestore').then(({ setDoc }) =>
      setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    )
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [carsSnap, inquiriesSnap] = await Promise.all([
    getDocs(collection(db, 'cars')),
    getDocs(collection(db, 'inquiries')),
  ])

  const cars = carsSnap.docs.map(d => d.data())
  const inquiries = inquiriesSnap.docs.map(d => d.data())
  const brands = new Set(cars.map(c => c.brand)).size

  return {
    totalCars: cars.length,
    availableCars: cars.filter(c => c.status === 'available').length,
    soldCars: cars.filter(c => c.status === 'sold').length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.status === 'new').length,
    uniqueBrands: brands,
  }
}
