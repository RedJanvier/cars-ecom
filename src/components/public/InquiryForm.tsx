'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createInquiry } from '@/lib/db'
import { translations, Locale } from '@/lib/i18n'
import { Car, Settings } from '@/types'
import { sendInquiryNotification } from '@/lib/notifications'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

interface InquiryFormProps {
  car: Car
  settings: Settings | null
  locale?: Locale
}

export default function InquiryForm({ car, settings, locale = 'en' }: InquiryFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const t = translations[locale].inquiry

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: locale === 'en'
        ? `I'm interested in the ${car.title}. Please contact me with more details.`
        : `Je suis intéressé(e) par le ${car.title}. Veuillez me contacter.`,
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      

      // Save inquiry to PocketBase
      const inquiry = await createInquiry({
        car: car.id,
        car_title: car.title,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        
      })

      // Send notification
      if (settings) {
        try {
          await sendInquiryNotification({ ...inquiry, ...data, car_title: car.title } as any, settings)
        } catch (notifErr) {
          console.error('Notification failed:', notifErr)
          // Don't fail the form submission if notification fails
        }
      }

      setSubmitted(true)
      toast.success(t.success)
      reset()
    } catch (err) {
      console.error('Inquiry failed:', err)
      toast.error(t.error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium">{t.success}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
        >
          {locale === 'en' ? 'Send another inquiry' : 'Envoyer une autre demande'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {t.name} *
        </label>
        <input
          {...register('name')}
          className={cn('input-clean', errors.name && 'border-red-400 focus:ring-red-400')}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {t.email} *
        </label>
        <input
          {...register('email')}
          type="email"
          className={cn('input-clean', errors.email && 'border-red-400 focus:ring-red-400')}
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {t.phone} *
        </label>
        <input
          {...register('phone')}
          type="tel"
          className={cn('input-clean', errors.phone && 'border-red-400 focus:ring-red-400')}
          placeholder="+33 6 00 00 00 00"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {t.message} *
        </label>
        <textarea
          {...register('message')}
          rows={4}
          className={cn('input-clean resize-none', errors.message && 'border-red-400 focus:ring-red-400')}
          placeholder={t.message_placeholder}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full"
      >
        {submitting ? t.sending : t.submit}
      </button>
    </form>
  )
}
