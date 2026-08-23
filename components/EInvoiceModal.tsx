'use client'

import React from 'react'
import { Printer, X, CheckCircle2, MapPin, Calendar, Users, ShieldCheck, Mail, Phone } from 'lucide-react'

interface BookingData {
  id: number
  packageName: string
  country: string
  name: string
  email: string
  phone: string
  travelDate: string
  participants: number
  notes?: string
  status: string
  createdAt: string
  unitPrice?: number
  totalAmount?: number
}

interface EInvoiceModalProps {
  booking: BookingData
  onClose: () => void
}

export default function EInvoiceModal({ booking, onClose }: EInvoiceModalProps) {
  const handlePrint = () => {
    window.print()
  }

  const invoiceNumber = `INV-NVA-${new Date(booking.createdAt).getFullYear()}${String(new Date(booking.createdAt).getMonth() + 1).padStart(2, '0')}-${String(booking.id).padStart(4, '0')}`
  const bookingCode = `NOVA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const pricePerPerson = booking.unitPrice || 12500000
  const subtotal = pricePerPerson * (booking.participants || 1)
  const serviceFee = 250000
  const grandTotal = booking.totalAmount || (subtotal + serviceFee)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 print:shadow-none print:border-none print:w-full print:max-w-none print:my-0">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">E-Tiket & Invoice Perjalanan Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket & Invoice Sheet */}
        <div className="p-8 space-y-6 text-zinc-900 text-xs bg-white print:p-0">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-black text-sm flex items-center justify-center">
                  N
                </div>
                <span className="text-xl font-extrabold tracking-tight text-zinc-900">NOVA Travel</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">PT NOVA Travel Nusantara · Premium International Journeys</p>
              <p className="text-[10px] text-zinc-400">Jakarta, Indonesia · support@novatravel.id</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-md uppercase tracking-wider border border-emerald-300">
                {booking.status === 'confirmed' ? 'LUNAS / CONFIRMED' : booking.status.toUpperCase()}
              </span>
              <p className="font-mono font-bold text-zinc-900 text-xs mt-1">{invoiceNumber}</p>
              <p className="text-[10px] text-zinc-500">Kode Booking: <strong className="font-mono text-zinc-900">{bookingCode}</strong></p>
            </div>
          </div>

          {/* Passenger & Travel Details Grid */}
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Informasi Pemesan</span>
              <p className="font-bold text-zinc-900 text-sm">{booking.name}</p>
              <p className="text-zinc-600 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-zinc-400" />
                {booking.email}
              </p>
              <p className="text-zinc-600 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-zinc-400" />
                {booking.phone}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Detail Perjalanan</span>
              <p className="font-bold text-zinc-900 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {booking.packageName} ({booking.country})
              </p>
              <p className="text-zinc-600 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-zinc-400" />
                Keberangkatan: <strong>{booking.travelDate}</strong>
              </p>
              <p className="text-zinc-600 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-zinc-400" />
                Jumlah Peserta: <strong>{booking.participants} Orang</strong>
              </p>
            </div>
          </div>

          {/* Pricing Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 text-xs">Rincian Pembayaran</h4>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-600 font-semibold border-b border-zinc-200">
                    <th className="p-3">Deskripsi Item</th>
                    <th className="p-3 text-center">Jumlah</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-3 font-medium text-zinc-900">Paket Wisata: {booking.packageName}</td>
                    <td className="p-3 text-center">{booking.participants} Pax</td>
                    <td className="p-3 text-right font-mono">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pricePerPerson)}
                    </td>
                    <td className="p-3 text-right font-bold text-zinc-900 font-mono">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-600">Biaya Layanan & Pengurusan Dokumen</td>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right font-mono">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(serviceFee)}
                    </td>
                    <td className="p-3 text-right font-bold text-zinc-900 font-mono">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(serviceFee)}
                    </td>
                  </tr>
                  <tr className="bg-zinc-50 font-bold border-t-2 border-zinc-900 text-sm">
                    <td colSpan={3} className="p-3.5 text-right text-zinc-900">TOTAL PEMBAYARAN</td>
                    <td className="p-3.5 text-right text-emerald-700 font-mono text-base">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Terms & Verification Stamp */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400">
            <div>
              <p className="font-semibold text-zinc-600">Catatan Resmi:</p>
              <p>E-Tiket ini berlaku sebagai bukti sah pemesanan paket wisata NOVA Travel.</p>
              <p>Harap tunjukkan dokumen ini saat Check-in bersama paspor aktif.</p>
            </div>

            <div className="text-center space-y-1">
              <div className="w-16 h-16 border-2 border-zinc-900 rounded-lg p-1 mx-auto flex items-center justify-center font-mono font-bold text-[9px] text-zinc-900 tracking-tighter leading-tight bg-zinc-50">
                VERIFIED<br />NOVA-QR
              </div>
              <span className="block font-mono text-[9px] text-zinc-500">Scan to Verify</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
