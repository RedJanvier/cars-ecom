'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MessageSquare, Check, Trash2, ExternalLink } from 'lucide-react'
import { getInquiries, updateInquiryStatus, deleteInquiry as deleteInquiryDb } from '@/lib/db'
import { Inquiry } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [total, setTotal] = useState(0)

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const result = await getInquiries(filter)
      setInquiries(result.items)
      setTotal(result.total)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchInquiries() }, [filter])

  const markAs = async (id: string, status: string) => {
    try {
      await updateInquiryStatus(id, status)
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as any } : null)
      toast.success(`Marked as ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    try {
      await deleteInquiryDb(id)
      setInquiries(prev => prev.filter(i => i.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const statusColors: Record<string, string> = { new: 'badge-blue', read: 'badge-gray', replied: 'badge-green' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inquiries</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} total inquiries</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'new', 'read', 'replied'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize',
              filter === f ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-5 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No inquiries found.</div>
            ) : (
              inquiries.map(inquiry => (
                <button key={inquiry.id}
                  onClick={() => { setSelected(inquiry); if (inquiry.status === 'new') markAs(inquiry.id, 'read') }}
                  className={cn('w-full text-left p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', selected?.id === inquiry.id && 'bg-sky-50 dark:bg-sky-900/10')}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
                      inquiry.status === 'new' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}>
                      {inquiry.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={cn('text-sm font-medium truncate', inquiry.status === 'new' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>{inquiry.name}</p>
                        <span className={cn('badge text-xs shrink-0', statusColors[inquiry.status])}>{inquiry.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{inquiry.car_title}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(inquiry.created).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{selected.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(selected.created).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => markAs(selected.id, 'replied')} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-colors"><Check className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm"><Mail className="w-4 h-4 text-slate-400 shrink-0" /><a href={`mailto:${selected.email}`} className="text-sky-500 hover:underline">{selected.email}</a></div>
                <div className="flex items-center gap-2.5 text-sm"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><a href={`tel:${selected.phone}`} className="text-sky-500 hover:underline">{selected.phone}</a></div>
                <div className="flex items-center gap-2.5 text-sm"><ExternalLink className="w-4 h-4 text-slate-400 shrink-0" /><span className="text-slate-600 dark:text-slate-400">{selected.car_title}</span></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-slate-400" /><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</span></div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selected.message}</p>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.car_title}`} className="btn-primary text-sm flex-1 text-center"><Mail className="w-4 h-4" />Reply by Email</a>
                <a href={`tel:${selected.phone}`} className="btn-secondary text-sm flex-1 text-center"><Phone className="w-4 h-4" />Call</a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
              <MessageSquare className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700" />
              Select an inquiry to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
