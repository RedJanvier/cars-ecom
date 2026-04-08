'use client'

import { useState, useEffect } from 'react'
import { Save, Mail, Phone, MessageSquare, Building, Globe, Eye, EyeOff } from 'lucide-react'
import { getSettings, saveSettings } from '@/lib/db'
import { Settings } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const Field = ({ label, name, value, onChange, placeholder, type = 'text' }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="input-clean text-sm" placeholder={placeholder} />
  </div>
)

const SecretInput = ({ name, label, value, onChange, showSecret, onToggleSecret, placeholder }: { name: string; label: string; value: string; onChange: (value: string) => void; showSecret: boolean; onToggleSecret: () => void; placeholder?: string }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <input type={showSecret ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} className="input-clean text-sm pr-10" placeholder={placeholder} />
      <button type="button" onClick={onToggleSecret} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
)

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({ notification_method: 'email', dealership_name: 'AutoElite' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'dealership' | 'notifications' | 'hero'>('dealership')

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getSettings()
        if (s) setSettings(s)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await saveSettings(settings)
      toast.success('Settings saved!')
    } catch (err) { console.error(err); toast.error('Failed to save settings') } finally { setSaving(false) }
  }

  const set = (key: keyof Settings, value: string) => setSettings(prev => ({ ...prev, [key]: value }))
  const toggleSecret = (key: string) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))

  const tabs = [
    { id: 'dealership', label: 'Dealership', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'hero', label: 'Homepage', icon: Globe },
  ] as const

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32" />
      <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your dealership and notification settings.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary text-sm">
          {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</span> : <><Save className="w-4 h-4" />Save Settings</>}
        </button>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200')}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dealership' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Dealership Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Dealership Name" name="dealership_name" value={settings.dealership_name || ''} onChange={(v) => set('dealership_name', v)} placeholder="AutoElite" />
            <Field label="Contact Email" name="dealership_email" value={settings.dealership_email || ''} onChange={(v) => set('dealership_email', v)} type="email" placeholder="contact@autoelite.com" />
            <Field label="Contact Phone" name="dealership_phone" value={settings.dealership_phone || ''} onChange={(v) => set('dealership_phone', v)} placeholder="+33 1 00 00 00 00" />
            <Field label="Address" name="dealership_address" value={settings.dealership_address || ''} onChange={(v) => set('dealership_address', v)} placeholder="123 Avenue des Voitures" />
            <Field label="City" name="dealership_city" value={settings.dealership_city || ''} onChange={(v) => set('dealership_city', v)} placeholder="Paris" />
            <Field label="Country" name="dealership_country" value={settings.dealership_country || ''} onChange={(v) => set('dealership_country', v)} placeholder="France" />
            <Field label="Instagram" name="social_instagram" value={settings.social_instagram || ''} onChange={(v) => set('social_instagram', v)} placeholder="https://instagram.com/..." />
            <Field label="Facebook" name="social_facebook" value={settings.social_facebook || ''} onChange={(v) => set('social_facebook', v)} placeholder="https://facebook.com/..." />
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Notification Method</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose how you will be notified when someone submits an inquiry.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'email', label: 'Email Only', icon: Mail },
                { value: 'sms', label: 'SMS Only', icon: Phone },
                { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { value: 'all', label: 'All Methods', icon: Globe },
              ].map(method => (
                <button key={method.value} type="button" onClick={() => set('notification_method', method.value)}
                  className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all',
                    settings.notification_method === method.value
                      ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-400 dark:border-sky-600 text-sky-700 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300')}>
                  <method.icon className="w-5 h-5" />{method.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Admin Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Admin Email" name="admin_email" value={settings.admin_email || ''} onChange={(v) => set('admin_email', v)} type="email" placeholder="admin@autoelite.com" />
              <Field label="Admin Phone (for SMS)" name="admin_phone" value={settings.admin_phone || ''} onChange={(v) => set('admin_phone', v)} placeholder="+250790000000" />
              <Field label="WhatsApp Number" name="admin_whatsapp" value={settings.admin_whatsapp || ''} onChange={(v) => set('admin_whatsapp', v)} placeholder="+250780000000" />
            </div>
          </div>

          {(settings.notification_method === 'email' || settings.notification_method === 'all') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">EmailJS Configuration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get credentials at <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">emailjs.com</a>. Free: 200 emails/month.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Service ID" name="emailjs_service_id" value={settings.emailjs_service_id || ''} onChange={(v) => set('emailjs_service_id', v)} placeholder="service_xxxxxxx" />
                <Field label="Template ID" name="emailjs_template_id" value={settings.emailjs_template_id || ''} onChange={(v) => set('emailjs_template_id', v)} placeholder="template_xxxxxxx" />
                <SecretInput name="emailjs_public_key" label="Public Key" value={settings.emailjs_public_key || ''} onChange={(v) => set('emailjs_public_key', v)} showSecret={showSecrets.emailjs_public_key || false} onToggleSecret={() => toggleSecret('emailjs_public_key')} placeholder="xxxxxxxxxxxxxxxxxxxx" />
              </div>
            </div>
          )}

          {(settings.notification_method === 'sms' || settings.notification_method === 'all') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Twilio SMS Configuration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get credentials at <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">twilio.com</a>.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Account SID" name="twilio_account_sid" value={settings.twilio_account_sid || ''} onChange={(v) => set('twilio_account_sid', v)} placeholder="ACxxxxxxxxxxxxxxx" />
                <SecretInput name="twilio_auth_token" label="Auth Token" value={settings.twilio_auth_token || ''} onChange={(v) => set('twilio_auth_token', v)} showSecret={showSecrets.twilio_auth_token || false} onToggleSecret={() => toggleSecret('twilio_auth_token')} placeholder="xxxxxxxxxxxxxxx" />
                <Field label="From Number" name="twilio_from_number" value={settings.twilio_from_number || ''} onChange={(v) => set('twilio_from_number', v)} placeholder="+15005550006" />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Homepage Content</h2>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Hero Headline" name="hero_headline_en" value={settings.hero_headline_en || ''} onChange={(v) => set('hero_headline_en', v)} placeholder="Drive Your Dream Vehicle Today" />
            <Field label="Hero Subtitle" name="hero_subtitle_en" value={settings.hero_subtitle_en || ''} onChange={(v) => set('hero_subtitle_en', v)} placeholder="Quality new and used cars..." />
          </div>
        </div>
      )}
    </div>
  )
}
