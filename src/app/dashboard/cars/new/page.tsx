import CarForm from '@/components/dashboard/CarForm'

export default function NewCarPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Car</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fill in the details to list a new vehicle.</p>
      </div>
      <CarForm />
    </div>
  )
}
