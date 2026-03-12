'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Fuel, Gauge, Calendar, Settings2, Zap, Users, Palette, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { getCarBySlug, getCarById, getSettings } from '@/lib/db'
import { translations, Locale } from '@/lib/i18n'
import { formatPrice, formatMileage, getCarDescription, cn } from '@/lib/utils'
import { Car, Settings } from '@/types'
import InquiryForm from '@/components/public/InquiryForm'

export default function CarDetailPage() {
  const params = useParams()
  const [locale] = useState<Locale>('en')
  const [car, setCar] = useState<Car | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const t = translations[locale]

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const slugOrId = params.slug as string
        let found: Car | null = await getCarBySlug(slugOrId)
        if (!found) found = await getCarById(slugOrId)
        setCar(found)
        const s = await getSettings()
        setSettings(s)
      } catch (err) {
        console.error('Car not found:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCar()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Vehicle not found</p>
          <Link href="/cars" className="btn-primary">Back to listings</Link>
        </div>
      </div>
    )
  }

  const images: string[] = car.images || []
  const currentImage = images[currentImageIdx]
  const statusColors = { available: 'badge-green', sold: 'badge-red', reserved: 'badge-yellow' }
  const specs = [
    { icon: Calendar, label: t.car.year, value: car.year },
    { icon: Fuel, label: t.car.mileage, value: `${formatMileage(car.mileage, locale)} ${t.common.km}` },
    { icon: Zap, label: t.car.power, value: `${car.power_hp} ${t.common.hp}` },
    { icon: Settings2, label: t.car.transmission, value: car.transmission === 'manual' ? t.car.transmission_manual : t.car.transmission_automatic },
    { icon: Gauge, label: t.car.engine, value: `${car.engine_cc} ${t.common.cc}` },
    { icon: Users, label: t.car.seats, value: car.seats },
    { icon: Palette, label: t.car.color, value: car.color },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link href="/cars" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />{t.car.back}
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 truncate">{car.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg">
              {currentImage ? (
                <Image src={currentImage} alt={car.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImageIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentImageIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                    {currentImageIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImageIdx(i)} className={cn('relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all', i === currentImageIdx ? 'border-sky-500 shadow-lg shadow-sky-500/20' : 'border-transparent opacity-60 hover:opacity-100')}>
                    <Image src={img} alt={`${car.title} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{t.car.description}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {getCarDescription(car, locale) || 'No description available.'}
              </p>
            </div>

            {car.features && car.features.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t.car.features}</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">{feature}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('badge text-xs', statusColors[car.status])}>{t.car[`status_${car.status}` as keyof typeof t.car] as string}</span>
                <span className={cn('badge text-xs', car.condition === 'new' ? 'badge-blue' : 'badge-gray')}>{car.condition === 'new' ? t.car.condition_new : t.car.condition_used}</span>
              </div>
              <p className="text-sky-500 text-sm font-semibold uppercase tracking-wider mb-1">{car.brand}</p>
              <h1 className="font-display text-2xl text-slate-900 dark:text-white mb-4">{car.title}</h1>
              <div className="flex items-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(car.price, locale)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <spec.icon className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{spec.label}</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {car.status === 'available' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t.inquiry.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{t.inquiry.subtitle}</p>
                <InquiryForm car={car} settings={settings} locale={locale} />
              </div>
            )}

            {settings?.admin_whatsapp && (
              <a
                href={`https://wa.me/${settings.admin_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
