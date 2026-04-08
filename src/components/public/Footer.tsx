'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { getSettings } from '@/lib/db'
import { Settings } from '@/types'

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const f = translations.en.footer
  const nav = translations.en.nav

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const name = settings?.dealership_name || 'AutoElite'
  const address = [settings?.dealership_address, settings?.dealership_city, settings?.dealership_country].filter(Boolean).join(', ')
  const phone = settings?.dealership_phone || ''
  const email = settings?.dealership_email || ''
  const instagram = settings?.social_instagram || '#'
  const facebook = settings?.social_facebook || '#'

  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl text-white">{name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {f.tagline}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{f.quick_links}</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: nav.home },
                { href: '/cars', label: nav.cars },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-sky-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{f.contact}</h3>
            <ul className="space-y-3">
              {address && (
                <li className="flex items-start gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-sky-400 transition-colors">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-sky-400 transition-colors">{email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} {name}. {f.rights}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
