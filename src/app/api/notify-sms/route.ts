import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { inquiry, settings } = await request.json()

    if (!settings?.twilio_account_sid || !settings?.twilio_auth_token) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 400 })
    }

    const message = `🚗 New Car Inquiry!\nFrom: ${inquiry.name}\nCar: ${inquiry.car_title}\nPhone: ${inquiry.phone}\nEmail: ${inquiry.email}\nMessage: ${inquiry.message}`

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Messages.json`

    const formData = new URLSearchParams()
    formData.append('From', settings.twilio_from_number)
    formData.append('To', settings.admin_phone)
    formData.append('Body', message)

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Twilio error:', error)
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('SMS API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
