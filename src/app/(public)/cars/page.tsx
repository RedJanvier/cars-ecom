'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getCars } from '@/lib/db'
import { translations } from '@/lib/i18n'
import { CAR_BRANDS, BODY_TYPES, FUEL_TYPES, cn } from '@/lib/utils'
import { Car, FilterState, Locale } from '@/types'
import CarCard from '@/components/public/CarCard'

export default function CarsPage() {
  const [locale] = useState<Locale>('en')
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({ sort: '-createdAt', search: '' })
  const t = translations[locale]

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getCars(filters, 12)
      setCars(result.items)
      setHasMore(result.hasMore)
    } catch (err) {
      console.error('Failed to fetch cars:', err)
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchCars() }, [fetchCars])

  const setFilter = (key: keyof FilterState, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters({ sort: '-createdAt', search: '' })

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'sort' && k !== 'search' && v).length

  const FilterSelect = ({ label, filterKey, options }: {
    label: string; filterKey: keyof FilterState; options: { value: string; label: string }[]
  }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={filters[filterKey] as string || ''}
          onChange={e => setFilter(filterKey, e.target.value || undefined)}
          className="w-full appearance-none input-clean text-sm pr-8"
        >
          <option value="">All</option>
          {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl text-slate-900 dark:text-white mb-1">{t.cars.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.cars.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by brand, model..."
                value={filters.search || ''}
                onChange={e => setFilter('search', e.target.value || undefined)}
                className="input-clean pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.sort || '-createdAt'}
                onChange={e => setFilter('sort', e.target.value)}
                className="input-clean text-sm min-w-[160px]"
              >
                <option value="-createdAt">{t.cars.sort_newest}</option>
                <option value="price">{t.cars.sort_price_asc}</option>
                <option value="-price">{t.cars.sort_price_desc}</option>
                <option value="-year">{t.cars.sort_year_desc}</option>
              </select>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                  filtersOpen
                    ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t.filters.title}
                {activeFilterCount > 0 && (
                  <span className="bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          {filtersOpen && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <FilterSelect label={t.filters.brand} filterKey="brand" options={CAR_BRANDS.map(b => ({ value: b, label: b }))} />
                <FilterSelect label={t.filters.condition} filterKey="condition" options={[
                  { value: 'new', label: t.car.condition_new },
                  { value: 'used', label: t.car.condition_used },
                ]} />
                <FilterSelect label={t.filters.fuel} filterKey="fuel_type" options={FUEL_TYPES.map(f => ({
                  value: f, label: t.car[`fuel_${f}` as keyof typeof t.car] as string || f,
                }))} />
                <FilterSelect label={t.filters.transmission} filterKey="transmission" options={[
                  { value: 'manual', label: t.car.transmission_manual },
                  { value: 'automatic', label: t.car.transmission_automatic },
                ]} />
                <FilterSelect label={t.filters.body} filterKey="body_type" options={BODY_TYPES.map(b => ({ value: b, label: b.charAt(0).toUpperCase() + b.slice(1) }))} />
                <div className="flex items-end">
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors">
                      <X className="w-4 h-4" />{t.filters.clear}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {loading ? '...' : `${cars.length} vehicles found`}
        </p>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse overflow-hidden">
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg mb-4">{t.cars.no_results}</p>
            <button onClick={clearFilters} className="btn-secondary">{t.cars.reset_filters}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cars.map(car => (<CarCard key={car.id} car={car} locale={locale} />))}
          </div>
        )}
      </div>
    </div>
  )
}
