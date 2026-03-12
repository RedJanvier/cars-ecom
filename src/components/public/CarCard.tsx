'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fuel, Gauge, Calendar, Settings2, ArrowRight } from 'lucide-react'
import { Car } from '@/types'
import { formatPrice, formatMileage, cn } from '@/lib/utils'
import { translations, Locale } from '@/lib/i18n'

interface CarCardProps {
  car: Car
  locale?: Locale
}

export default function CarCard({ car, locale = 'en' }: CarCardProps) {
  const t = translations[locale]
  const mainImage = car.images?.[0]
  const imageUrl = mainImage ?? null

  const statusColors = {
    available: 'badge-green',
    sold: 'badge-red',
    reserved: 'badge-yellow',
  }

  const conditionLabel = car.condition === 'new' ? t.car.condition_new : t.car.condition_used
  const fuelLabel = t.car[`fuel_${car.fuel_type}` as keyof typeof t.car] as string || car.fuel_type
  const transmissionLabel = car.transmission === 'manual' ? t.car.transmission_manual : t.car.transmission_automatic

  return (
    <Link href={`/cars/${car.slug || car.id}`} className="group block">
      <article className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-hover shadow-sm">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={car.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
                <circle cx="7.5" cy="14.5" r="1.5"/>
                <circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn('badge text-xs font-semibold', statusColors[car.status])}>
              {t.car[`status_${car.status}` as keyof typeof t.car] as string}
            </span>
            <span className={cn('badge text-xs font-medium', car.condition === 'new' ? 'badge-blue' : 'badge-gray')}>
              {conditionLabel}
            </span>
          </div>

          {car.featured && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-amber-400 text-amber-900 text-xs font-semibold">
                ★ {t.common.featured}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3">
            <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-1">{car.brand}</p>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {car.title || `${car.year} ${car.brand} ${car.model}`}
            </h3>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs">{car.year}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs">{fuelLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs">{formatMileage(car.mileage)} {t.common.km}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs">{transmissionLabel}</span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatPrice(car.price, locale)}
              </p>
            </div>
            <span className="flex items-center gap-1 text-sky-500 text-sm font-medium group-hover:gap-2 transition-all">
              {t.common.view_details}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
