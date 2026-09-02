import { describe, it, expect } from 'vitest'
import {
  cn,
  formatPrice,
  formatMileage,
  getCarTitle,
  getCarDescription,
  slugify,
  CAR_BRANDS,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
} from '@/lib/utils'
import type { Car } from '@/types'

function makeCar(overrides: Partial<Car> = {}): Car {
  return {
    id: '1',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    title: '',
    slug: 'test',
    brand: 'BYD',
    model: 'Seal',
    year: 2024,
    price: 25_000_000,
    condition: 'new',
    fuel_type: 'electric',
    transmission: 'automatic',
    mileage: 0,
    color: 'Black',
    doors: 4,
    seats: 5,
    battery_range: 550,
    description_en: 'A great electric car.',
    features: [],
    images: [],
    featured: false,
    status: 'available',
    body_type: 'sedan',
    ...overrides,
  }
}

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('dedupes conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })
})

describe('formatPrice', () => {
  it('formats prices below a million with RWF and thousands separators', () => {
    expect(formatPrice(950_000)).toBe('RWF 950,000')
  })

  it('formats a whole number of millions without decimals', () => {
    expect(formatPrice(25_000_000)).toBe('RWF 25M')
  })

  it('formats fractional millions with one decimal', () => {
    expect(formatPrice(1_500_000)).toBe('RWF 1.5M')
  })

  it('treats exactly one million as the millions threshold', () => {
    expect(formatPrice(1_000_000)).toBe('RWF 1M')
  })
})

describe('formatMileage', () => {
  it('adds thousands separators', () => {
    expect(formatMileage(34_000)).toBe('34,000')
  })

  it('handles zero', () => {
    expect(formatMileage(0)).toBe('0')
  })
})

describe('getCarTitle', () => {
  it('returns the explicit title when present', () => {
    expect(getCarTitle(makeCar({ title: '2023 Toyota BZ4X' }))).toBe('2023 Toyota BZ4X')
  })

  it('falls back to year + brand + model when title is empty', () => {
    expect(getCarTitle(makeCar({ title: '', year: 2024, brand: 'BYD', model: 'Seal' }))).toBe(
      '2024 BYD Seal'
    )
  })
})

describe('getCarDescription', () => {
  it('returns the English description', () => {
    expect(getCarDescription(makeCar({ description_en: 'Hello' }))).toBe('Hello')
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('2023 Toyota BZ4X')).toBe('2023-toyota-bz4x')
  })

  it('strips special characters', () => {
    expect(slugify('BYD Seal (Premium)!')).toBe('byd-seal-premium')
  })

  it('collapses whitespace and underscores into single hyphens', () => {
    expect(slugify('a   b__c')).toBe('a-b-c')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --hello--  ')).toBe('hello')
  })
})

describe('static catalog data', () => {
  it('derives CAR_BRANDS from CAR_MODELS keys', () => {
    expect(CAR_BRANDS).toEqual(Object.keys(CAR_MODELS))
    expect(CAR_BRANDS).toContain('BYD')
  })

  it('exposes the expected body and fuel types', () => {
    expect(BODY_TYPES).toContain('suv')
    expect(FUEL_TYPES).toContain('electric')
  })
})
