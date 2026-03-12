import { Inquiry, Settings } from '@/types'

export async function sendInquiryNotification(inquiry: Inquiry, settings: Settings): Promise<void> {
  const method = settings.notification_method || 'email'

  if (method === 'email' || method === 'all') {
    await sendEmailNotification(inquiry, settings)
  }

  if ((method === 'sms' || method === 'all') && settings.twilio_account_sid) {
    await sendSMSNotification(inquiry, settings)
  }
}

async function sendEmailNotification(inquiry: Inquiry, settings: Settings): Promise<void> {
  if (!settings.emailjs_service_id || !settings.emailjs_public_key) return

  // EmailJS - client-side email
  const emailjs = await import('@emailjs/browser')
  
  await emailjs.send(
    settings.emailjs_service_id,
    settings.emailjs_template_id,
    {
      to_email: settings.admin_email,
      dealership_name: settings.dealership_name,
      from_name: inquiry.name,
      from_email: inquiry.email,
      from_phone: inquiry.phone,
      car_title: inquiry.car_title,
      message: inquiry.message,
      reply_to: inquiry.email,
    },
    settings.emailjs_public_key
  )
}

async function sendSMSNotification(inquiry: Inquiry, settings: Settings): Promise<void> {
  // This would go through a serverless function or API route
  // Twilio requires server-side auth — use Next.js API route
  const response = await fetch('/api/notify-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inquiry, settings }),
  })
  
  if (!response.ok) {
    console.error('SMS notification failed')
  }
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function buildInquiryMessage(inquiry: Inquiry, settings: Settings): string {
  return `New car inquiry from ${inquiry.name}
Vehicle: ${inquiry.car_title}
Phone: ${inquiry.phone}
Email: ${inquiry.email}
Message: ${inquiry.message}`
}
