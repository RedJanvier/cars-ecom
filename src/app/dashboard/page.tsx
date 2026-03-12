'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, MessageSquare, TrendingUp, Eye, Plus, ArrowRight } from 'lucide-react'
import { getDashboardStats, getInquiries } from '@/lib/db'
import { Inquiry } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalCars: 0, availableCars: 0, soldCars: 0, totalInquiries: 0, newInquiries: 0 })
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, inq] = await Promise.all([getDashboardStats(), getInquiries(undefined, 5)])
        setStats({ totalCars: s.totalCars, availableCars: s.availableCars, soldCars: s.soldCars, totalInquiries: inq.total, newInquiries: s.newInquiries })
        setRecentInquiries(inq.items)
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Cars', value: stats.totalCars, icon: Car, color: 'blue', href: '/dashboard/cars' },
    { label: 'Available', value: stats.availableCars, icon: Eye, color: 'green', href: '/dashboard/cars' },
    { label: 'Sold', value: stats.soldCars, icon: TrendingUp, color: 'purple', href: '/dashboard/cars' },
    { label: 'Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'orange', href: '/dashboard/inquiries', badge: stats.newInquiries },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    orange: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/dashboard/cars/new" className="btn-primary text-sm"><Plus className="w-4 h-4" />Add Car</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[card.color]}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                {card.badge ? <span className="badge badge-red text-xs">{card.badge} new</span> : null}
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {loading ? <span className="inline-block w-8 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /> : card.value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Inquiries</h2>
          <Link href="/dashboard/inquiries" className="text-sm text-sky-500 hover:text-sky-600 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : recentInquiries.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No inquiries yet.</div>
          ) : (
            recentInquiries.map(inquiry => (
              <div key={inquiry.id} className="p-5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-semibold text-sm shrink-0">
                  {inquiry.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{inquiry.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{inquiry.car_title}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`badge text-xs ${inquiry.status === 'new' ? 'badge-blue' : 'badge-gray'}`}>{inquiry.status}</span>
                  <p className="text-xs text-slate-400 mt-1">{new Date(inquiry.created).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
