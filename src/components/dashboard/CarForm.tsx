'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createCar, updateCar, uploadCarImage, deleteCarImage } from '@/lib/db'
import { CAR_BRANDS, CAR_MODELS, BODY_TYPES, FUEL_TYPES, slugify, cn } from '@/lib/utils'
import { Car } from '@/types'

const schema = z.object({
  title: z.string().min(3),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  condition: z.enum(['new', 'used']),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg']),
  transmission: z.enum(['manual', 'automatic']),
  body_type: z.enum(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van']),
  mileage: z.coerce.number().min(0),
  color: z.string().min(1),
  doors: z.coerce.number().min(1).max(10),
  seats: z.coerce.number().min(1).max(20),
  power_hp: z.coerce.number().min(0),
  engine_cc: z.coerce.number().min(0),
  description_en: z.string().optional(),
  description_fr: z.string().optional(),
  status: z.enum(['available', 'sold', 'reserved']),
  featured: z.boolean().optional(),
  features: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CarFormProps { car?: Car }

export default function CarForm({ car }: CarFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(car?.images || [])
  const [removedImages, setRemovedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: car ? {
      title: car.title, brand: car.brand, model: car.model, year: car.year, price: car.price,
      condition: car.condition, fuel_type: car.fuel_type, transmission: car.transmission,
      body_type: car.body_type, mileage: car.mileage, color: car.color, doors: car.doors,
      seats: car.seats, power_hp: car.power_hp, engine_cc: car.engine_cc,
      description_en: car.description_en, description_fr: car.description_fr,
      status: car.status, featured: car.featured,
      features: car.features?.join(', '),
    } : {
      condition: 'new', fuel_type: 'electric', transmission: 'automatic', body_type: 'sedan',
      status: 'available', doors: 4, seats: 5, year: new Date().getFullYear(), mileage: 0, featured: false,
    },
  })

  const brand = watch('brand')
  const model = watch('model')
  const year = watch('year')

  const autoTitle = () => {
    if (brand && model && year) setValue('title', `${year} ${brand} ${model}`)
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const featuresArr = (data.features || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      const slug = slugify(`${data.year}-${data.brand}-${data.model}`)

      if (car) {
        // Delete removed images from Storage
        await Promise.all(removedImages.map(url => deleteCarImage(url)))
        // Upload new images
        const newUrls = await Promise.all(newImages.map(f => uploadCarImage(f, car.id)))
        const allImages = [...existingImages, ...newUrls]
        await updateCar(car.id, { ...data, features: featuresArr, images: allImages, slug } as any)
        toast.success('Car updated successfully!')
      } else {
        // Create car first to get ID, then upload images
        const created = await createCar({ ...data, features: featuresArr, images: [], slug } as any)
        const imageUrls = await Promise.all(newImages.map(f => uploadCarImage(f, created.id)))
        if (imageUrls.length > 0) {
          await updateCar(created.id, { images: imageUrls })
        }
        toast.success('Car added successfully!')
      }

      router.push('/dashboard/cars')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save car. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  const Select = ({ name, options }: { name: keyof FormData; options: { value: string; label: string }[] }) => (
    <select {...register(name)} className="input-clean text-sm">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Photos</h2>
        <div className="flex flex-wrap gap-3">
          {existingImages.map(url => (
            <div key={url} className="relative w-28 h-20 rounded-xl overflow-hidden group">
              <Image src={url} alt="" fill className="object-cover" />
              <button type="button" onClick={() => { setExistingImages(p => p.filter(i => i !== url)); setRemovedImages(p => [...p, url]) }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {newImages.map((file, i) => (
            <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden group">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setNewImages(p => p.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-sky-400 hover:text-sky-400 transition-colors">
            <Upload className="w-5 h-5" /><span className="text-xs">Add Photo</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => e.target.files && setNewImages(p => [...p, ...Array.from(e.target.files!)])} />
        <p className="text-xs text-slate-400 mt-2">Images are uploaded to cloud storage.</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Brand" error={errors.brand?.message}>
            <select {...register('brand')} onBlur={autoTitle} className="input-clean text-sm">
              <option value="">Select brand</option>
              {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Model" error={errors.model?.message}>
            {brand && CAR_MODELS[brand]?.length ? (
              <select {...register('model')} onBlur={autoTitle} className="input-clean text-sm">
                <option value="">Select model</option>
                {CAR_MODELS[brand].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input {...register('model')} onBlur={autoTitle} className="input-clean text-sm" placeholder="Enter model name" />
            )}
          </Field>
          <Field label="Year" error={errors.year?.message}>
            <input {...register('year')} type="number" onBlur={autoTitle} className="input-clean text-sm" />
          </Field>
          <Field label="Title / Listing Name" error={errors.title?.message}>
            <div className="flex gap-2">
              <input {...register('title')} className="input-clean text-sm flex-1" placeholder="e.g. 2021 BMW 3 Series Sport" />
              <button type="button" onClick={autoTitle} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 text-xs font-medium transition-colors">Auto</button>
            </div>
          </Field>
          <Field label="Price (€)" error={errors.price?.message}>
            <input {...register('price')} type="number" className="input-clean text-sm" placeholder="0" />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Select name="status" options={[{ value: 'available', label: 'Available' }, { value: 'reserved', label: 'Reserved' }, { value: 'sold', label: 'Sold' }]} />
          </Field>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Technical Specifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Field label="Condition"><Select name="condition" options={[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }]} /></Field>
          <Field label="Body Type"><Select name="body_type" options={BODY_TYPES.map(b => ({ value: b, label: b.charAt(0).toUpperCase() + b.slice(1) }))} /></Field>
          <Field label="Fuel Type"><Select name="fuel_type" options={FUEL_TYPES.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))} /></Field>
          <Field label="Transmission"><Select name="transmission" options={[{ value: 'manual', label: 'Manual' }, { value: 'automatic', label: 'Automatic' }]} /></Field>
          <Field label="Mileage (km)"><input {...register('mileage')} type="number" className="input-clean text-sm" /></Field>
          <Field label="Power (HP)"><input {...register('power_hp')} type="number" className="input-clean text-sm" /></Field>
          <Field label="Engine (cc)"><input {...register('engine_cc')} type="number" className="input-clean text-sm" /></Field>
          <Field label="Color"><input {...register('color')} className="input-clean text-sm" placeholder="e.g. Midnight Black" /></Field>
          <Field label="Doors"><input {...register('doors')} type="number" className="input-clean text-sm" /></Field>
          <Field label="Seats"><input {...register('seats')} type="number" className="input-clean text-sm" /></Field>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Content</h2>
        <div className="space-y-4">
          <Field label="Description (English)"><textarea {...register('description_en')} rows={4} className="input-clean resize-none text-sm" placeholder="Describe the vehicle in English..." /></Field>
          <Field label="Description (French)"><textarea {...register('description_fr')} rows={4} className="input-clean resize-none text-sm" placeholder="Décrivez le véhicule en français..." /></Field>
          <Field label="Features (comma separated)"><input {...register('features')} className="input-clean text-sm" placeholder="e.g. Sunroof, Heated Seats, Navigation..." /></Field>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4 rounded text-sky-500 border-slate-300 dark:border-slate-600" />
            <label htmlFor="featured" className="text-sm font-medium text-slate-700 dark:text-slate-300">Feature this car on the homepage</label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</span> : car ? 'Save Changes' : 'Add Car'}
        </button>
      </div>
    </form>
  )
}
