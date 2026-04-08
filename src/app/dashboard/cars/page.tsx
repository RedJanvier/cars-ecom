'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { getAllCarsAdmin, deleteCar, updateCar } from '@/lib/db'
import { formatPrice, cn } from '@/lib/utils'
import { Car } from '@/types'
import toast from 'react-hot-toast'

export default function DashboardCarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCars = async (s?: string) => {
    setLoading(true)
    try {
      const result = await getAllCarsAdmin(s || search)
      setCars(result.items)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchCars() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return
    setDeleting(id)
    try {
      await deleteCar(id)
      setCars(prev => prev.filter(c => c.id !== id))
      toast.success('Car deleted successfully')
    } catch { toast.error('Failed to delete car') } finally { setDeleting(null) }
  }

  const toggleFeatured = async (car: Car) => {
    try {
      await updateCar(car.id, { featured: !car.featured })
      setCars(prev => prev.map(c => c.id === car.id ? { ...c, featured: !c.featured } : c))
      toast.success(`Car ${car.featured ? 'removed from' : 'added to'} featured`)
    } catch { toast.error('Failed to update car') }
  }

  const statusColors: Record<string, string> = { available: 'badge-green', sold: 'badge-red', reserved: 'badge-yellow' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cars</h1>
        <Link href="/dashboard/cars/new" className="btn-primary text-sm"><Plus className="w-4 h-4" />Add Car</Link>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchCars(search)} placeholder="Search (press Enter)..." className="input-clean !pl-[40px]" />
        </div>
        <button onClick={() => fetchCars(search)} className="btn-secondary text-sm px-4">Search</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3.5">Vehicle</th>
                <th className="text-left px-4 py-3.5 hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3.5 hidden md:table-cell">Year</th>
                <th className="text-left px-4 py-3.5 hidden lg:table-cell">Condition</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    {[...Array(4)].map((_, j) => (<td key={j} className="px-4 py-4 hidden md:table-cell"><div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>))}
                    <td className="px-5 py-4" />
                  </tr>
                ))
              ) : cars.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No cars found. <Link href="/dashboard/cars/new" className="text-sky-500 hover:underline">Add your first car</Link></td></tr>
              ) : (
                cars.map(car => {
                  const imgUrl = car.images?.[0] ?? null
                  return (
                    <tr key={car.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={car.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[160px]">{car.title}</p>
                            <p className="text-xs text-slate-500">{car.brand} · {car.model}</p>
                          </div>
                          {car.featured && <span className="badge badge-yellow text-xs hidden sm:flex">★ Featured</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-sm font-medium text-slate-900 dark:text-white">{formatPrice(car.price)}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-sm text-slate-600 dark:text-slate-400">{car.year}</td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className={cn('badge text-xs', car.condition === 'new' ? 'badge-blue' : 'badge-gray')}>{car.condition}</span>
                      </td>
                      <td className="px-4 py-4"><span className={cn('badge text-xs', statusColors[car.status])}>{car.status}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleFeatured(car)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors">
                            {car.featured ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Link href={`/dashboard/cars/${car.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-500 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(car.id)} disabled={deleting === car.id} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
