'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import type { TravelPackage, PackageDeparture } from '@/lib/types'
import Navbar from '@/components/Navbar'
import BookingStepDetails from '@/components/booking/BookingStepDetails'
import BookingStepReview from '@/components/booking/BookingStepReview'
import BookingStepPayment from '@/components/booking/BookingStepPayment'

interface ContactForm {
  contactName: string
  contactEmail: string
  contactPhone: string
  participants: number
}

type Step = 1 | 2 | 3

export default function BookingFlowPage({
  params,
}: {
  params: Promise<{ packageId: string; departureId: string }>
}) {
  const { packageId, departureId } = use(params)
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [pkg, setPkg] = useState<TravelPackage | null>(null)
  const [departure, setDeparture] = useState<PackageDeparture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking state preserved across steps
  const [contact, setContact] = useState<ContactForm>({ contactName: '', contactEmail: '', contactPhone: '', participants: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState<{ id: number; bookingCode: string; totalAmount: number } | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pkgRes, depRes] = await Promise.all([
        fetch(`/api/packages/${packageId}`),
        fetch(`/api/packages/${packageId}/departures?all=1`),
      ])

      if (!pkgRes.ok) throw new Error('Paket tidak ditemukan')
      const pkgData = await pkgRes.json()
      setPkg(pkgData)

      if (!depRes.ok) throw new Error('Gagal memuat jadwal')
      const deps: PackageDeparture[] = await depRes.json()
      const dep = deps.find(d => d.id === parseInt(departureId))
      if (!dep) throw new Error('Jadwal keberangkatan tidak ditemukan')
      if (dep.status === 'sold_out' || dep.status === 'cancelled') {
        throw new Error('Jadwal ini sudah penuh atau dibatalkan')
      }
      setDeparture(dep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // Auth check + data fetch
  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?redirect=/booking/${packageId}/${departureId}`)
        return
      }
      fetchData()
    })
    // fetchData and router are stable refs — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, departureId])

  const handleDetailsNext = (form: ContactForm) => {
    setContact(form)
    setStep(2)
  }

  const handleReviewNext = async (promoCode?: string, discountAmount?: number) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: parseInt(packageId),
          departureId: parseInt(departureId),
          contactName: contact.contactName,
          contactEmail: contact.contactEmail,
          contactPhone: contact.contactPhone,
          participants: contact.participants,
          ...(promoCode ? { voucherCode: promoCode, discountAmount } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat booking')
      setBookingResult({
        id: data.id,
        bookingCode: data.bookingCode ?? data.booking_code ?? '',
        totalAmount: data.totalAmount ?? data.total_amount ?? 0,
      })
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !pkg || !departure) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <p className="text-lg font-semibold text-black mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-neutral-500 mb-6">{error ?? 'Paket atau jadwal tidak ditemukan'}</p>
          <button onClick={() => router.back()} className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium">
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">

        {error && step !== 3 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Tutup</button>
          </div>
        )}

        {step === 1 && (
          <BookingStepDetails pkg={pkg} departure={departure} onNext={handleDetailsNext} />
        )}
        {step === 2 && (
          <BookingStepReview
            pkg={pkg}
            departure={departure}
            contact={contact}
            travelers={[]}
            onNext={handleReviewNext}
            onBack={() => setStep(1)}
            submitting={submitting}
          />
        )}
        {step === 3 && bookingResult && (
          <BookingStepPayment
            bookingId={bookingResult.id}
            bookingCode={bookingResult.bookingCode}
            totalAmount={bookingResult.totalAmount}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}
