import { supabase } from './supabase'
import { Car, Inquiry, Settings, FilterState } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Map PostgreSQL snake_case timestamps to camelCase used by TypeScript types */
function mapRow<T>(row: Record<string, unknown>): T {
  const { created_at, updated_at, ...rest } = row
  return {
    ...rest,
    createdAt: created_at,
    updatedAt: updated_at,
  } as T
}

function mapRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map(r => mapRow<T>(r))
}

// ─── Image Storage ───────────────────────────────────────────────────────────

export async function uploadCarImage(file: File, carId: string): Promise<string> {
  const path = `cars/${carId}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('car-images')
    .upload(path, file)
  if (error) throw error
  const { data } = supabase.storage
    .from('car-images')
    .getPublicUrl(path)
  return data.publicUrl
}

export async function deleteCarImage(url: string): Promise<void> {
  try {
    // Extract path from Supabase public URL
    // Format: https://<project>.supabase.co/storage/v1/object/public/car-images/<path>
    const marker = '/storage/v1/object/public/car-images/'
    const idx = url.indexOf(marker)
    if (idx === -1) return
    const path = url.slice(idx + marker.length)
    await supabase.storage.from('car-images').remove([path])
  } catch {
    // Ignore if already deleted
  }
}

// ─── Cars ────────────────────────────────────────────────────────────────────

export async function getCars(
  filters: FilterState = {},
  pageSize = 12,
  lastDoc?: number
): Promise<{ items: Car[]; lastDoc: number | null; hasMore: boolean }> {
  const offset = lastDoc ?? 0

  let q = supabase.from('cars').select('*', { count: 'exact' })

  // Filters
  if (filters.brand) q = q.eq('brand', filters.brand)
  if (filters.condition) q = q.eq('condition', filters.condition)
  if (filters.fuel_type) q = q.eq('fuel_type', filters.fuel_type)
  if (filters.transmission) q = q.eq('transmission', filters.transmission)
  if (filters.body_type) q = q.eq('body_type', filters.body_type)
  if (filters.min_price) q = q.gte('price', filters.min_price)
  if (filters.max_price) q = q.lte('price', filters.max_price)
  if (filters.min_year) q = q.gte('year', filters.min_year)
  if (filters.max_year) q = q.lte('year', filters.max_year)

  // Server-side search (replaces old client-side filtering)
  if (filters.search) {
    const term = `%${filters.search}%`
    q = q.or(`title.ilike.${term},brand.ilike.${term},model.ilike.${term}`)
  }

  // Sort
  const sortField = filters.sort?.replace('-', '') || 'created_at'
  const ascending = filters.sort ? !filters.sort.startsWith('-') : false
  const safeSortField = ['price', 'year', 'created_at'].includes(sortField) ? sortField
    : sortField === 'createdAt' ? 'created_at' : 'created_at'
  q = q.order(safeSortField, { ascending })

  // Pagination
  q = q.range(offset, offset + pageSize - 1)

  const { data, count, error } = await q
  if (error) throw error

  const items = mapRows<Car>(data ?? [])
  const total = count ?? 0
  const hasMore = offset + pageSize < total

  return {
    items,
    lastDoc: hasMore ? offset + pageSize : null,
    hasMore,
  }
}

export async function getCarById(id: string): Promise<Car> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error('Document not found')
  return mapRow<Car>(data)
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .single()
  if (error) return null
  return mapRow<Car>(data)
}

export async function getFeaturedCars(max = 6): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('featured', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(max)
  if (error) throw error
  return mapRows<Car>(data ?? [])
}

export async function createCar(data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car> {
  const { data: row, error } = await supabase
    .from('cars')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return mapRow<Car>(row)
}

export async function updateCar(id: string, data: Partial<Car>): Promise<void> {
  // Remove client-side timestamp fields — DB trigger handles updated_at
  const { createdAt: _ca, updatedAt: _ua, id: _id, ...rest } = data as Record<string, unknown>
  const { error } = await supabase
    .from('cars')
    .update(rest)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCar(id: string): Promise<void> {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getAllCarsAdmin(
  searchTerm?: string,
  pageSize = 15,
  lastDoc?: number
): Promise<{ items: Car[]; lastDoc: number | null; hasMore: boolean }> {
  const offset = lastDoc ?? 0

  let q = supabase.from('cars').select('*', { count: 'exact' })

  // Server-side search (replaces old client-side filtering)
  if (searchTerm) {
    const term = `%${searchTerm}%`
    q = q.or(`title.ilike.${term},brand.ilike.${term},model.ilike.${term}`)
  }

  q = q.order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data, count, error } = await q
  if (error) throw error

  const items = mapRows<Car>(data ?? [])
  const total = count ?? 0
  const hasMore = offset + pageSize < total

  return {
    items,
    lastDoc: hasMore ? offset + pageSize : null,
    hasMore,
  }
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

export async function createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Inquiry> {
  const { data: row, error } = await supabase
    .from('inquiries')
    .insert({ ...data, status: 'new' })
    .select()
    .single()
  if (error) throw error
  return mapRow<Inquiry>(row)
}

export async function getInquiries(
  statusFilter?: string,
  pageSize = 20,
  lastDoc?: number
): Promise<{ items: Inquiry[]; lastDoc: number | null; total: number }> {
  const offset = lastDoc ?? 0

  let q = supabase.from('inquiries').select('*', { count: 'exact' })
  if (statusFilter && statusFilter !== 'all') {
    q = q.eq('status', statusFilter)
  }
  q = q.order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data, count, error } = await q
  if (error) throw error

  return {
    items: mapRows<Inquiry>(data ?? []),
    lastDoc: offset + pageSize < (count ?? 0) ? offset + pageSize : null,
    total: count ?? 0,
  }
}

export async function updateInquiryStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Settings ────────────────────────────────────────────────────────────────

const SETTINGS_ID = 'main'

export async function getSettings(): Promise<Settings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single()
    if (error || !data) return null
    return mapRow<Settings>(data)
  } catch {
    return null
  }
}

export async function saveSettings(data: Partial<Settings>): Promise<void> {
  // Remove client-side fields the DB manages
  const { createdAt: _ca, updatedAt: _ua, id: _id, ...rest } = data as Record<string, unknown>
  const { error } = await supabase
    .from('settings')
    .upsert({ id: SETTINGS_ID, ...rest })
  if (error) throw error
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [
    { count: totalCars },
    { count: availableCars },
    { count: soldCars },
    { count: totalInquiries },
    { count: newInquiries },
    { data: brandRows },
  ] = await Promise.all([
    supabase.from('cars').select('*', { count: 'exact', head: true }),
    supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('cars').select('brand'),
  ])

  const brands = new Set((brandRows ?? []).map((r: { brand: string }) => r.brand)).size

  return {
    totalCars: totalCars ?? 0,
    availableCars: availableCars ?? 0,
    soldCars: soldCars ?? 0,
    totalInquiries: totalInquiries ?? 0,
    newInquiries: newInquiries ?? 0,
    uniqueBrands: brands,
  }
}
