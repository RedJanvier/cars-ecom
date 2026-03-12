'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getCarById } from '@/lib/db'
import { Car } from '@/types'
import CarForm from '@/components/dashboard/CarForm'

export default function EditCarPage() {
  const params = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const found = await getCarById(params.id as string)
        setCar(found)
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    )
  }

  if (!car) return <p className="text-slate-500">Car not found.</p>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Car</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{car.title}</p>
      </div>
      <CarForm car={car} />
    </div>
  )
}
