'use client'

import dynamic from 'next/dynamic'
import { Download, Loader2 } from 'lucide-react'
import type { EticketBooking } from './EticketPDF'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center gap-2 text-sm text-white/40 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl cursor-not-allowed"
      >
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
      </button>
    ),
  }
)

const EticketPDF = dynamic(() => import('./EticketPDF'), { ssr: false })

export default function EticketDownloadButton({
  booking,
}: {
  booking: EticketBooking
}) {
  return (
    <PDFDownloadLink
      document={<EticketPDF booking={booking} />}
      fileName={`nova-ticket-${booking.id}.pdf`}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-colors"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {loading ? 'Menyiapkan PDF...' : 'Download Tiket PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
