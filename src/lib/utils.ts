import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Car } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    const formatted = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)
    return `RWF ${formatted}M`
  }
  return `RWF ${new Intl.NumberFormat('en-US').format(price)}`
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage)
}

export function getCarTitle(car: Car): string {
  return car.title || `${car.year} ${car.brand} ${car.model}`
}

export function getCarDescription(car: Car): string {
  return car.description_en
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const CAR_MODELS: Record<string, string[]> = {
  'BYD': ['Yuan Up', 'Yuan Plus', 'Song Plus', 'Leopard Titanium 3', 'Seal', 'Destroyer', 'Tang DM-I', 'Seagull', 'Tang L', 'Dolphin'],
  'AION': ['V', 'V Plus', 'LX', 'LX Plus'],
  'Radar': ['RD6'],
  'Toyota': ['BZ3X', 'BZ4X', 'CHR'],
  'Volkswagen': ['ID4'],
  'Dongfeng': ['Aeolus'],
  'iCAR': ['03'],
  'Jetour': ['Traveler'],
  'Changan': [],
  'Hycan': [],
  'WM Motor': ['EX5-Z'],
  'Nezha': ['X', 'V'],
  'Neta': ['U', 'U Pro'],
  'Weimar': ['EX5', 'W6'],
  'Geome': [],
  'Venucia': [],
  'Nissan': [],
  'Trumpchi': [],
}

export const CAR_BRANDS = Object.keys(CAR_MODELS)

export const CAR_FEATURES = [
  'Air Conditioning', 'Heated Seats', 'Ventilated Seats', 'Leather Seats',
  'Sunroof / Panoramic Roof', 'Navigation / GPS', 'Bluetooth', 'Apple CarPlay',
  'Android Auto', 'Backup Camera', '360° Camera', 'Parking Sensors',
  'Cruise Control', 'Adaptive Cruise Control', 'Lane Assist', 'Blind Spot Monitor',
  'Keyless Entry', 'Push Button Start', 'Remote Start', 'Power Tailgate',
  'LED Headlights', 'Fog Lights', 'Alloy Wheels', 'Roof Rails',
  'Wireless Charging', 'USB-C Ports', 'Premium Sound System', 'Heads-Up Display',
  'Regenerative Braking', 'Fast Charging', 'V2L (Vehicle-to-Load)', 'Heat Pump',
  'OTA Updates', 'Auto Pilot / ADAS', 'Electric Folding Mirrors', 'Rain Sensing Wipers',
  'Tire Pressure Monitoring', 'ABS', 'ESP', 'Airbags (6+)',
]

export const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van']

export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg']

export const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)
