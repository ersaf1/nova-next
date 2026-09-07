'use client'

import React, { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { EticketBooking } from './EticketPDF'

export default function EticketDownloadButton({
  booking,
}: {
  booking: EticketBooking
}) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/pdf`)
      if (!res.ok) {
        throw new Error('Failed to generate PDF')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nova-ticket-${booking.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      // Fallback: open direct URL in new tab
      window.open(`/api/bookings/${booking.id}/pdf`, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {downloading ? 'Menyiapkan PDF...' : 'Download Tiket PDF'}
    </button>
  )
}

