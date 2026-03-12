import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Car } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(mileage: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US').format(mileage)
}

export function getCarTitle(car: Car): string {
  return car.title || `${car.year} ${car.brand} ${car.model}`
}

export function getCarDescription(car: Car, locale: 'en' | 'fr'): string {
  return locale === 'fr' && car.description_fr ? car.description_fr : car.description_en
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const CAR_BRANDS = [
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Citroën', 'Dacia',
  'Ferrari', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia',
  'Lamborghini', 'Land Rover', 'Lexus', 'Maserati', 'Mazda', 'Mercedes-Benz',
  'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault',
  'Seat', 'Skoda', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
]

export const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van']

export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg']

export const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
