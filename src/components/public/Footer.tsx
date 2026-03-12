'use client'

import Link from 'next/link'
import { Car, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react'
import { useState } from 'react'
import { translations, Locale } from '@/lib/i18n'

export default function Footer() {
  const [locale] = useState<Locale>('en')
  const f = translations[locale].footer
  const nav = translations[locale].nav

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
              <span className="font-display text-xl text-white">
                Auto<span className="text-sky-500">Elite</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {f.tagline}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-slate-400 hover:text-white" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4 text-slate-400 hover:text-white" />
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
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <span>123 Avenue des Voitures, Paris, France</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                <a href="tel:+33100000000" className="hover:text-sky-400 transition-colors">+33 1 00 00 00 00</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                <a href="mailto:contact@autoelite.com" className="hover:text-sky-400 transition-colors">contact@autoelite.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} AutoElite. {f.rights}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
