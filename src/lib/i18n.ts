export const translations = {
  en: {
    nav: {
      home: 'Home',
      cars: 'Browse Cars',
      about: 'About',
      contact: 'Contact',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'New & Used Vehicles',
      cta_browse: 'Browse Inventory',
      cta_contact: 'Contact Us',
      stats_cars: 'Cars Available',
      stats_brands: 'Brands',
      stats_sold: 'Cars Sold',
    },
    cars: {
      title: 'Our Inventory',
      subtitle: 'Find your perfect vehicle from our curated selection',
      filter_all: 'All',
      filter_new: 'New',
      filter_used: 'Used',
      sort_newest: 'Newest First',
      sort_price_asc: 'Price: Low to High',
      sort_price_desc: 'Price: High to Low',
      sort_year_desc: 'Year: Newest',
      no_results: 'No cars found matching your filters.',
      reset_filters: 'Reset Filters',
      per_page: 'per page',
    },
    car: {
      condition_new: 'New',
      condition_used: 'Used',
      fuel_petrol: 'Petrol',
      fuel_diesel: 'Diesel',
      fuel_electric: 'Electric',
      fuel_hybrid: 'Hybrid',
      fuel_lpg: 'LPG',
      transmission: 'Transmission',
      transmission_manual: 'Manual',
      transmission_automatic: 'Automatic',
      mileage: 'Mileage',
      year: 'Year',
      battery_range: 'Battery Range',
      doors: 'Doors',
      seats: 'Seats',
      color: 'Color',
      features: 'Features',
      description: 'Description',
      status_available: 'Available',
      status_sold: 'Sold',
      status_reserved: 'Reserved',
      inquire: 'Inquire About This Car',
      share: 'Share',
      back: 'Back to Listings',
    },
    inquiry: {
      title: 'Interested in this vehicle?',
      subtitle: "Fill in your details and we'll get back to you shortly.",
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      message: 'Message',
      message_placeholder: "I'm interested in this vehicle. Please contact me with more details.",
      submit: 'Send Inquiry',
      sending: 'Sending...',
      success: 'Your inquiry has been sent! We will contact you soon.',
      error: 'Failed to send inquiry. Please try again.',
    },
    filters: {
      title: 'Filters',
      brand: 'Brand',
      condition: 'Condition',
      fuel: 'Fuel Type',
      transmission: 'Transmission',
      body: 'Body Type',
      price_range: 'Price Range',
      year_range: 'Year',
      apply: 'Apply Filters',
      clear: 'Clear All',
    },
    footer: {
      tagline: 'Your trusted partner for quality vehicles.',
      quick_links: 'Quick Links',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong.',
      view_details: 'View Details',
      featured: 'Featured',
      km: 'km',
      km_range: 'km range',
    },
  },
}

export type Locale = 'en'

export function t(locale: Locale, path: string): string {
  const keys = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = translations[locale]
  for (const key of keys) {
    result = result?.[key]
  }
  return result ?? path
}
