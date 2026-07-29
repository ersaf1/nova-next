import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder_key')
const FROM = process.env.EMAIL_FROM ?? 'Nova Travel <onboarding@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'

// ─── Booking Confirmation ───────────────────────────────────────────────────
export async function sendBookingConfirmation(opts: {
  to: string
  name: string
  packageName: string
  bookingId: string | number
  travelDate: string
  participants: number
  totalAmount: number
}) {
  if (!process.env.RESEND_API_KEY) return // Skip if not configured
  const { to, name, packageName, bookingId, travelDate, participants, totalAmount } = opts
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Booking Confirmed — ${packageName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="font-size:24px;font-weight:700;color:#0a0a0a">Booking Confirmed!</h1>
        <p style="color:#555">Hi ${name},</p>
        <p style="color:#555">Your booking has been confirmed. Here are your details:</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Booking ID</td><td style="padding:8px 0;font-weight:600">#${bookingId}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Package</td><td style="padding:8px 0;font-weight:600">${packageName}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Travel Date</td><td style="padding:8px 0;font-weight:600">${travelDate}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Participants</td><td style="padding:8px 0;font-weight:600">${participants}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Total</td><td style="padding:8px 0;font-weight:600;color:#0a0a0a">Rp ${totalAmount.toLocaleString('id-ID')}</td></tr>
        </table>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:600">View Booking</a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">Nova Travel · 195 Countries · Powered by AI</p>
      </div>
    `,
  })
}

// ─── Payment Confirmed ──────────────────────────────────────────────────────
export async function sendPaymentConfirmed(opts: {
  to: string
  name: string
  packageName: string
  bookingId: string | number
  amount: number
}) {
  if (!process.env.RESEND_API_KEY) return
  const { to, name, packageName, bookingId, amount } = opts
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Payment Received — ${packageName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="font-size:24px;font-weight:700;color:#0a0a0a">Payment Received!</h1>
        <p style="color:#555">Hi ${name}, your payment of <strong>Rp ${amount.toLocaleString('id-ID')}</strong> for <strong>${packageName}</strong> (Booking #${bookingId}) has been received.</p>
        <p style="color:#555">Your trip is now confirmed. We'll send further details closer to your travel date.</p>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:600">View Booking</a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">Nova Travel · 195 Countries · Powered by AI</p>
      </div>
    `,
  })
}

// ─── Refund Notification ────────────────────────────────────────────────────
export async function sendRefundNotification(opts: {
  to: string
  name: string
  packageName: string
  bookingId: string | number
  status: 'approved' | 'rejected'
  reason?: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const { to, name, packageName, bookingId, status, reason } = opts
  const approved = status === 'approved'
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Refund ${approved ? 'Approved' : 'Rejected'} — ${packageName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="font-size:24px;font-weight:700;color:#0a0a0a">Refund ${approved ? 'Approved' : 'Rejected'}</h1>
        <p style="color:#555">Hi ${name},</p>
        <p style="color:#555">Your refund request for <strong>${packageName}</strong> (Booking #${bookingId}) has been <strong>${status}</strong>.</p>
        ${reason ? `<p style="color:#555">Reason: ${reason}</p>` : ''}
        ${approved ? '<p style="color:#555">Your refund will be processed within 3-5 business days.</p>' : ''}
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:600">View Booking</a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">Nova Travel · 195 Countries · Powered by AI</p>
      </div>
    `,
  })
}

// ─── Newsletter Welcome ─────────────────────────────────────────────────────
export async function sendNewsletterWelcome(opts: { to: string }) {
  if (!process.env.RESEND_API_KEY) return
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Welcome to Nova Travel Newsletter',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="font-size:24px;font-weight:700;color:#0a0a0a">You're in!</h1>
        <p style="color:#555">Thanks for subscribing to Nova Travel. You'll get the best deals, destination guides, and travel inspiration straight to your inbox.</p>
        <a href="${BASE_URL}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:600">Explore Destinations</a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">Nova Travel · 195 Countries · Powered by AI</p>
      </div>
    `,
  })
}
