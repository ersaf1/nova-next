export interface WhatsAppMessagePayload {
  phone: string
  name: string
  type: 'booking_created' | 'status_update' | 'reminder' | 'refund_update'
  data: {
    bookingId?: string | number
    bookingCode?: string
    packageName?: string
    travelDate?: string
    participants?: number
    status?: string
    totalAmount?: number
  }
}

export async function sendWhatsAppNotification(payload: WhatsAppMessagePayload): Promise<boolean> {
  const { phone, name, type, data } = payload
  const waToken = process.env.WHATSAPP_API_TOKEN || process.env.FONNTE_TOKEN

  // Clean phone number format (e.g., convert 0812... to 62812...)
  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1)
  }

  // Construct message based on type
  let messageText = ''

  if (type === 'booking_created') {
    messageText = `Halo *${name}*, terima kasih telah melakukan pemesanan di *NOVA Travel*! 🎉\n\n` +
      `📋 *Detail Booking Anda:*\n` +
      `• Kode Booking: *${data.bookingCode || '#' + data.bookingId}*\n` +
      `• Paket Wisata: *${data.packageName}*\n` +
      `• Tanggal Travel: *${data.travelDate}*\n` +
      `• Jumlah Peserta: *${data.participants} Orang*\n\n` +
      `Tim admin kami akan memverifikasi booking Anda. Anda dapat mengecek status perjalanan Anda kapan saja di Dashboard NOVA Travel.\n\n` +
      `Terima kasih!\n_NOVA Travel Team_`
  } else if (type === 'status_update') {
    const isConfirmed = data.status === 'confirmed'
    messageText = `Halo *${name}*,\n\n` +
      `Status booking perjalanan Anda (*${data.packageName}*) telah diperbarui menjadi:\n` +
      `👉 *${(data.status || '').toUpperCase()}* ${isConfirmed ? '✅' : '❌'}\n\n` +
      (isConfirmed
        ? `Selamat! Pembayaran/booking Anda telah dikonfirmasi. E-Tiket resmi Anda dapat diunduh di dashboard NOVA Travel.\n`
        : `Booking Anda dibatalkan. Jika ada pertanyaan, hubungi tim support kami.\n`) +
      `\n_NOVA Travel Support_`
  } else if (type === 'reminder') {
    messageText = `Halo *${name}*! 👋\n\n` +
      `Pengingat perjalanan untuk paket *${data.packageName}* yang akan berangkat pada *${data.travelDate}*.\n` +
      `Harap persiapkan paspor, visa (jika diperlukan), dan E-Tiket Anda.\n\n` +
      `Selamat menikmati liburan bersama NOVA Travel! ✈️🌟`
  } else if (type === 'refund_update') {
    messageText = `Halo *${name}*,\n\n` +
      `Pengajuan pengembalian dana (refund) untuk booking *${data.packageName}* telah diperbarui statusnya menjadi: *${(data.status || '').toUpperCase()}*.\n\n` +
      `Terima kasih,\n_NOVA Travel Team_`
  }

  console.log(`[WhatsApp Notification Log] Sending to ${cleanPhone}:`, messageText)

  if (!waToken) {
    // Graceful fallback when API token is not configured in .env
    return true
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': waToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: cleanPhone,
        message: messageText,
      })
    })

    const resData = await response.json()
    return resData.status === true
  } catch (err) {
    console.error('Failed to send WhatsApp message via Fonnte API:', err)
    return false
  }
}
