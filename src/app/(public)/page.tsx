'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Award, Clock, ChevronRight, Star, Zap } from 'lucide-react'
import { getFeaturedCars, getDashboardStats } from '@/lib/db'
import { translations } from '@/lib/i18n'
import { Car, Locale } from '@/types'
import CarCard from '@/components/public/CarCard'

export default function HomePage() {
  const [locale] = useState<Locale>('en')
  const [featuredCars, setFeaturedCars] = useState<Car[]>([])
  const [stats, setStats] = useState({ total: 0, brands: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const t = translations[locale]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cars, dashStats] = await Promise.all([
          getFeaturedCars(6),
          getDashboardStats(),
        ])
        setFeaturedCars(cars)
        setStats({ total: dashStats.totalCars, brands: dashStats.uniqueBrands, sold: dashStats.soldCars })
      } catch (err) {
        console.error('Failed to load cars:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="dark bg-slate-950">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-8 animate-fade-up">
              <Zap className="w-4 h-4" />
              {t.hero.badge}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight animate-fade-up animate-delay-100">
              Drive Your <span className="gradient-text">Dream</span><br />Vehicle Today
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up animate-delay-200">
              Discover our curated selection of premium new and pre-owned vehicles. Quality guaranteed, prices you&apos;ll love.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
              <Link href="/cars" className="btn-primary text-base px-8 py-4 shadow-lg shadow-sky-500/25">
                {t.hero.cta_browse}<ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/cars" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
                View all vehicles<ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-up animate-delay-400">
              {[
                { value: stats.total || '50+', label: t.hero.stats_cars },
                { value: stats.brands || '20+', label: t.hero.stats_brands },
                { value: '200+', label: t.hero.stats_sold },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
          <div className="w-0.5 h-8 bg-gradient-to-b from-transparent to-slate-600 rounded-full" />
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Quality Guaranteed', desc: 'Every vehicle is thoroughly inspected and certified before listing.' },
              { icon: Award, title: 'Best Prices', desc: 'Competitive pricing with transparent, no-hidden-fee policies.' },
              { icon: Clock, title: 'Fast Response', desc: 'Our team responds to inquiries within 2 hours during business hours.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-start p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-sky-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/20 transition-colors">
                  <item.icon className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sky-500 text-sm font-semibold uppercase tracking-wider mb-2">Handpicked Selection</p>
              <h2 className="font-display text-4xl text-white">Featured Vehicles</h2>
            </div>
            <Link href="/cars" className="hidden md:flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-700/50 rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-slate-700/50 rounded w-1/3" />
                    <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map(car => (
                <CarCard key={car.id} car={car} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>No featured cars yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-sky-900/40 via-sky-800/30 to-indigo-900/40 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (<Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />))}
          </div>
          <h2 className="font-display text-4xl text-white mb-4">Ready to find your car?</h2>
          <p className="text-slate-400 mb-8 text-lg">Browse our full inventory and contact us directly. No pressure, just great cars.</p>
          <Link href="/cars" className="btn-primary text-base px-10 py-4 shadow-lg shadow-sky-500/25">
            {t.hero.cta_browse}<ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
