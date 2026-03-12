export type Car = {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  slug: string
  brand: string
  model: string
  year: number
  price: number
  condition: 'new' | 'used'
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg'
  transmission: 'manual' | 'automatic'
  mileage: number
  color: string
  doors: number
  seats: number
  power_hp: number
  engine_cc: number
  description_en: string
  description_fr: string
  features: string[]
  images: string[]
  featured: boolean
  status: 'available' | 'sold' | 'reserved'
  body_type: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'pickup' | 'van'
}

export type Inquiry = {
  id: string
  createdAt: string
  updatedAt: string
  car: string
  car_title: string
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'read' | 'replied'
}

export type Settings = {
  id: string
  createdAt: string
  updatedAt: string
  admin_email: string
  admin_phone: string
  admin_whatsapp: string
  dealership_name: string
  dealership_address: string
  dealership_city: string
  dealership_country: string
  dealership_phone: string
  dealership_email: string
  notification_method: 'email' | 'sms' | 'whatsapp' | 'all'
  emailjs_service_id: string
  emailjs_template_id: string
  emailjs_public_key: string
  twilio_account_sid: string
  twilio_auth_token: string
  twilio_from_number: string
  hero_headline_en: string
  hero_headline_fr: string
  hero_subtitle_en: string
  hero_subtitle_fr: string
  social_instagram: string
  social_facebook: string
  logo: string
}

export type Locale = 'en' | 'fr'

export type FilterState = {
  brand?: string
  condition?: string
  fuel_type?: string
  transmission?: string
  body_type?: string
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  sort?: string
  search?: string
}
