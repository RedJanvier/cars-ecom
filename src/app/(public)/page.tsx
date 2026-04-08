'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Award, Clock, ChevronRight, Star, Zap, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFeaturedCars, getDashboardStats } from '@/lib/db'
import { translations } from '@/lib/i18n'
import { Car, Locale } from '@/types'
import CarCard from '@/components/public/CarCard'

export default function HomePage() {
  const [locale] = useState<Locale>('en')
  const [featuredCars, setFeaturedCars] = useState<Car[]>([])
  const [stats, setStats] = useState({ total: 0, brands: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const [heroSlide, setHeroSlide] = useState(0)
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

  const heroCards = featuredCars.slice(3, 6)

  useEffect(() => {
    if (heroCards.length < 2) return
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroCards.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [heroCards.length])

  return (
    <div className="dark bg-slate-950">
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Full-bleed background image with Ken Burns slow zoom-out */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&q=85&auto=format&fit=crop"
            alt="Luxury sports car"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Layered gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-900/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/55" />

        {/* Gold left accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-amber-400/65 to-transparent" />

        {/* Main content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-44 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left column: text ── */}
            <div className="max-w-xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-sm font-medium mb-8"
              >
                <Zap className="w-4 h-4" />
                {t.hero.badge}
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.25 }}
                className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-[1.05]"
              >
                Drive Your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100">
                  Dream
                </span>
                <br />Vehicle Today
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.45 }}
                className="text-slate-400 text-lg sm:text-xl mb-8 leading-relaxed"
              >
                Discover our curated selection of premium new and pre-owned vehicles.
                Quality guaranteed, prices you&apos;ll love.
              </motion.p>

              {/* Trust pills */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex flex-wrap gap-x-6 gap-y-2 mb-10"
              >
                {['Certified Pre-Owned', 'Free Test Drive', 'Best Price Guarantee'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-base transition-all duration-200 active:scale-95 shadow-lg shadow-amber-400/25"
                >
                  {t.hero.cta_browse} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/cars"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
                >
                  View all vehicles <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* ── Right column: auto-sliding featured cars (desktop only) ── */}
            <motion.div
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:flex flex-col gap-4 items-end"
            >
              {/* Vehicle showcase card */}
              <div className="w-full max-w-[360px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-slate-900/95">
                {heroCards.length === 0 ? (
                  /* Loading skeleton */
                  <>
                    <div className="aspect-[4/3] bg-slate-800 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <div className="h-3 bg-slate-700 rounded w-24 animate-pulse" />
                        <div className="h-3 bg-slate-700 rounded w-20 animate-pulse" />
                      </div>
                      <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-slate-700 rounded w-2/3 animate-pulse" />
                    </div>
                  </>
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={heroSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative">
                          <img
                            src={heroCards[heroSlide].images?.[0] ?? ''}
                            alt={heroCards[heroSlide].title}
                            className="w-full aspect-[4/3] object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-lg text-xs font-bold tracking-widest uppercase">
                              Featured
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs text-emerald-400 font-medium">● Available Now</span>
                          </div>
                          <h3 className="text-white font-semibold text-base mb-1">{heroCards[heroSlide].title}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-slate-400 text-sm">
                              {heroCards[heroSlide].year} · {heroCards[heroSlide].mileage.toLocaleString()} mi
                            </p>
                            <p className="text-amber-400 font-semibold text-sm">Contact for Price</p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Dot indicators */}
                    {heroCards.length > 1 && (
                      <div className="flex items-center justify-center gap-1.5 pb-4">
                        {heroCards.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setHeroSlide(i)}
                            className={`rounded-full transition-all duration-300 ${
                              i === heroSlide
                                ? 'w-5 h-1.5 bg-amber-400'
                                : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Floating warranty badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm shadow-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Full Warranty</div>
                  <div className="text-slate-500 text-xs">3-year comprehensive coverage</div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Bottom stats bar with glass effect */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-slate-950/75 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8 sm:gap-14">
                {[
                  { value: stats.total || '50+', label: t.hero.stats_cars },
                  { value: stats.brands || '20+', label: t.hero.stats_brands },
                  { value: '200+', label: t.hero.stats_sold },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.85 + i * 0.1 }}
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-white leading-none mb-1">{stat.value}</div>
                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="hidden sm:flex flex-col items-center gap-2"
              >
                <div className="text-[10px] tracking-[0.2em] uppercase text-slate-600">Scroll</div>
                <div className="w-0.5 h-6 bg-gradient-to-b from-transparent to-slate-600 rounded-full animate-bounce" />
              </motion.div>
            </div>
          </div>
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
