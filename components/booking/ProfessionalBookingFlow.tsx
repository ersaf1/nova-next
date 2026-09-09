'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Users,
  ShieldCheck,
  Calendar,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  Tag,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
  Ticket,
  X,
  Lock,
  HeartHandshake
} from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import { formatIDR, type PackageDeparture, type TravelPackage } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'

export interface Passenger {
  title: 'Tn.' | 'Ny.' | 'Nn.'
  name: string
  idType: 'KTP' | 'Paspor'
  idNumber: string
}

export interface ContactForm {
  name: string
  email: string
  phone: string
  notes: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  travelDate?: string
  passengers?: { [index: number]: { name?: string; idNumber?: string } }
}

interface PromoResult {
  valid: boolean
  code?: string
  discount_amount?: number
  message?: string
}

interface Props {
  initialPackage?: TravelPackage | null
  initialDeparture?: PackageDeparture | null
  packageIdParam?: string | null
  departureIdParam?: string | null
}

const STEPS = [
  { step: 1, title: 'Data Pemesan & Tamu', subtitle: 'Informasi kontak dan identitas penumpang' },
  { step: 2, title: 'Perlindungan & Add-ons', subtitle: 'Asuransi komprehensif dan layanan VIP' },
  { step: 3, title: 'Tinjauan & Pembayaran', subtitle: 'Konfirmasi rincian akhir perjalanan' },
]

export default function ProfessionalBookingFlow({
  initialPackage,
  initialDeparture,
  packageIdParam,
  departureIdParam,
}: Props) {
  const router = useRouter()
  const { formatPrice } = useCurrency()

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [pkg, setPkg] = useState<TravelPackage | null>(initialPackage ?? null)
  const [departure, setDeparture] = useState<PackageDeparture | null>(initialDeparture ?? null)
  const [packageDepartures, setPackageDepartures] = useState<PackageDeparture[]>([])
  const [loading, setLoading] = useState(!initialPackage)
  const [error, setError] = useState<string | null>(null)

  // Booking details
  const [participants, setParticipants] = useState<number>(1)
  const [customDate, setCustomDate] = useState<string>('')
  const [contact, setContact] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [passengers, setPassengers] = useState<Passenger[]>([
    { title: 'Tn.', name: '', idType: 'KTP', idNumber: '' },
  ])

  // Add-ons
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true)
  const [includeVipConcierge, setIncludeVipConcierge] = useState<boolean>(false)

  // Promo coupon
  const [couponInput, setCouponInput] = useState<string>('')
  const [appliedCoupon, setAppliedCoupon] = useState<PromoResult | null>(null)
  const [couponLoading, setCouponLoading] = useState<boolean>(false)
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false)
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])
  const [loadingAvailableCoupons, setLoadingAvailableCoupons] = useState<boolean>(false)

  // Submission state
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Reservation countdown timer (15 minutes simulation)
  const [timeLeft, setTimeLeft] = useState<number>(900)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [timeLeft])

  // Pre-fill user data & fetch missing package if needed
  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setContact((prev) => ({
          ...prev,
          name: prev.name || (data.user.user_metadata?.full_name as string) || (data.user.user_metadata?.name as string) || '',
          email: prev.email || data.user.email || '',
          phone: prev.phone || (data.user.user_metadata?.phone as string) || '',
        }))
      }
    })

    const initData = async () => {
      try {
        setLoading(true)
        const targetPkgId = packageIdParam || (initialPackage ? String(initialPackage.id) : null)

        if (targetPkgId) {
          const [pkgRes, depsRes] = await Promise.all([
            fetch(`/api/packages/${targetPkgId}`),
            fetch(`/api/packages/${targetPkgId}/departures?all=1`),
          ])

          if (pkgRes.ok) {
            const pData = await pkgRes.json()
            setPkg(pData)
          }

          if (depsRes.ok) {
            const dData: PackageDeparture[] = await depsRes.json()
            setPackageDepartures(dData)

            if (departureIdParam) {
              const matchedDep = dData.find((d) => d.id === parseInt(departureIdParam, 10))
              if (matchedDep) setDeparture(matchedDep)
            } else if (dData.length > 0 && !departure) {
              const activeDep = dData.find((d) => d.status !== 'sold_out' && d.status !== 'cancelled')
              if (activeDep) setDeparture(activeDep)
            }
          }
        } else {
          // No packageId param provided: fetch all published packages for selector
          const allRes = await fetch('/api/packages')
          if (allRes.ok) {
            const all = await allRes.json()
            if (Array.isArray(all) && all.length > 0) {
              setPkg(all[0])
              const firstDepsRes = await fetch(`/api/packages/${all[0].id}/departures?all=1`)
              if (firstDepsRes.ok) {
                const fDeps = await firstDepsRes.json()
                setPackageDepartures(fDeps)
                const activeDep = fDeps.find((d: PackageDeparture) => d.status !== 'sold_out' && d.status !== 'cancelled')
                if (activeDep) setDeparture(activeDep)
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat informasi paket perjalanan')
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [packageIdParam, departureIdParam])

  // Sync passengers array length with participant count
  useEffect(() => {
    setPassengers((prev) => {
      const current = [...prev]
      while (current.length < participants) {
        current.push({ title: 'Tn.', name: '', idType: 'KTP', idNumber: '' })
      }
      return current.slice(0, participants)
    })
  }, [participants])

  // Copy lead booker name to traveler 1
  const copyLeadBooker = () => {
    if (!contact.name.trim()) return
    setPassengers((prev) => {
      const copy = [...prev]
      copy[0] = { ...copy[0], name: contact.name }
      return copy
    })
  }

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // Price calculations
  const basePricePerPerson = departure?.price || pkg?.price || 0
  const subtotal = basePricePerPerson * participants
  const serviceFee = 250000 // Fixed IDR per booking
  const insurancePerPerson = 175000 // IDR per traveler
  const vipConciergeFee = 350000 // IDR per booking

  const insuranceTotal = includeInsurance ? insurancePerPerson * participants : 0
  const conciergeTotal = includeVipConcierge ? vipConciergeFee : 0
  const discountTotal = appliedCoupon?.discount_amount || 0
  const grandTotal = Math.max(0, subtotal + serviceFee + insuranceTotal + conciergeTotal - discountTotal)

  // Validation
  const validateStep1 = (): boolean => {
    const errs: FormErrors = {}
    if (!contact.name.trim()) errs.name = 'Nama pemesan wajib diisi sesuai identitas'
    if (!contact.email.trim() || !contact.email.includes('@')) errs.email = 'Alamat email aktif tidak valid'
    if (!contact.phone.replace(/\D/g, '').match(/^\d{8,15}$/)) errs.phone = 'Nomor WhatsApp / telepon tidak valid (8-15 digit)'

    if (!departure && !customDate) {
      errs.travelDate = 'Pilih tanggal keberangkatan yang diinginkan'
    }

    const passErrors: { [index: number]: { name?: string } } = {}
    let hasPassengerError = false
    passengers.forEach((p, idx) => {
      if (!p.name.trim() || p.name.trim().length < 2) {
        passErrors[idx] = { name: 'Nama lengkap wajib diisi minimal 2 karakter' }
        hasPassengerError = true
      }
    })

    if (hasPassengerError) {
      errs.passengers = passErrors
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Coupon Apply
  const applyCoupon = async (codeOverride?: string) => {
    const targetCode = (codeOverride || couponInput).trim().toUpperCase()
    if (!targetCode) return

    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedCoupon({
          valid: true,
          code: data.code || targetCode,
          discount_amount: data.discount_amount ?? data.discountAmount ?? 0,
          message: data.message,
        })
        setCouponInput(targetCode)
      } else {
        setAppliedCoupon({
          valid: false,
          message: data.message || 'Kode promo tidak memenuhi syarat minimum transaksi atau telah kedaluwarsa',
        })
      }
    } catch {
      setAppliedCoupon({ valid: false, message: 'Gagal memvalidasi kode promo' })
    } finally {
      setCouponLoading(false)
    }
  }

  const openCouponPicker = async () => {
    setShowCouponModal(true)
    if (availableCoupons.length === 0) {
      setLoadingAvailableCoupons(true)
      try {
        const res = await fetch('/api/coupons')
        const data = await res.json()
        setAvailableCoupons(Array.isArray(data) ? data : [])
      } catch {
      } finally {
        setLoadingAvailableCoupons(false)
      }
    }
  }

  // Handle Final Submission
  const handleProceedToPayment = async () => {
    if (!pkg) return
    if (!validateStep1()) {
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      const resolvedTravelDate = departure ? departure.startDate : customDate

      const payload = {
        packageId: pkg.id,
        packageName: pkg.title,
        departureId: departure?.id || null,
        contactName: contact.name,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        participants,
        travelDate: resolvedTravelDate,
        country: pkg.subtitle || pkg.category || 'Indonesia',
        passengers,
        notes: contact.notes,
        voucherCode: appliedCoupon?.valid ? appliedCoupon.code : undefined,
        discountAmount: discountTotal,
        insuranceIncluded: includeInsurance,
        vipConciergeIncluded: includeVipConcierge,
        serviceFee,
        totalAmount: grandTotal,
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memproses reservasi')

      // Redirect to dedicated payment checkout
      router.push(`/payment/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala saat memproses pesanan')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          Mempersiapkan Lembar Pemesanan...
        </p>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Paket Wisata Tidak Ditemukan</h2>
        <p className="text-xs text-stone-500 max-w-md">
          Silakan pilih paket perjalanan eksklusif yang tersedia di katalog NOVA.
        </p>
        <Link
          href="/packages"
          className="bg-stone-900 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-black transition-colors"
        >
          Jelajahi Paket Wisata
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Urgency Countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-[#F5F2EB]/90 border border-stone-300/70 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#C29B38]/15 border border-[#C29B38]/30 flex items-center justify-center text-[#9E7B27] shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900">
              Slot Keberangkatan Dikunci Sementara
            </p>
            <p className="text-[11px] text-stone-500">
              Selesaikan formulir pemesanan sebelum waktu habis untuk mengamankan kuota.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 shadow-2xs text-xs font-bold text-stone-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono">{formattedTimer}</span>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-3 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.step
            const isCompleted = currentStep > s.step

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step as 1 | 2 | 3)
                  else if (s.step === 2 && validateStep1()) setCurrentStep(2)
                }}
                disabled={s.step > currentStep + 1}
                className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  isCurrent
                    ? 'bg-stone-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-[#F5F2EB]/60 hover:bg-[#F5F2EB] text-stone-900 cursor-pointer'
                    : 'bg-transparent text-stone-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-white text-stone-900'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isCompleted ? <Check size={14} className="stroke-[3]" /> : s.step}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{s.title}</p>
                  <p className={`text-[10px] truncate ${isCurrent ? 'text-stone-300' : 'text-stone-400'}`}>
                    {s.subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Step Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ──────── STEP 1: Data Pemesan & Roster Tamu ──────── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Package & Schedule Selection Summary Card */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-2xs">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C29B38]">
                      Paket Perjalanan Terpilih
                    </span>
                    <h3 className="text-lg font-bold text-stone-950 mt-0.5">{pkg.title}</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={13} className="text-[#C29B38]" />
                      <span>{pkg.subtitle || pkg.category}</span>
                    </p>
                  </div>
                  {pkg.image && (
                    <div className="relative w-20 h-16 rounded-2xl overflow-hidden shrink-0 bg-stone-100 shadow-2xs">
                      <Image src={pkg.image} alt={pkg.title} fill className="object-cover" sizes="80px" />
                    </div>
                  )}
                </div>

                {/* Departure Schedule Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#C29B38]" />
                    <span>Pilih Jadwal Keberangkatan</span>
                  </label>

                  {packageDepartures.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {packageDepartures.map((dep) => {
                        const isSelectable = dep.status !== 'sold_out' && dep.status !== 'cancelled'
                        const isSelected = departure?.id === dep.id

                        return (
                          <button
                            key={dep.id}
                            type="button"
                            disabled={!isSelectable}
                            onClick={() => {
                              setDeparture(dep)
                              setCustomDate('')
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-stone-900 bg-[#F5F2EB]/50 ring-1 ring-stone-900/10 shadow-2xs'
                                : 'border-stone-200/80 bg-white hover:border-stone-300'
                            } ${!isSelectable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-stone-900">
                                {new Date(dep.startDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-stone-400 font-semibold">
                                {dep.remainingSlots} slot
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                              <span>Sampai {new Date(dep.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                              <span className="font-bold text-stone-800">{formatPrice(dep.price)}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={customDate}
                        onChange={(e) => {
                          setCustomDate(e.target.value)
                          setDeparture(null)
                        }}
                        className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                          formErrors.travelDate ? 'border-rose-500' : 'border-stone-200'
                        }`}
                      />
                      {formErrors.travelDate && (
                        <p className="text-rose-600 text-[11px] font-semibold">{formErrors.travelDate}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Participant Counter */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Users size={14} className="text-[#C29B38]" />
                      <span>Jumlah Wisatawan (Pax)</span>
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Maksimal {departure?.remainingSlots || 10} orang per reservasi
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-100 border border-stone-200 rounded-2xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                      disabled={participants <= 1}
                      className="w-8 h-8 rounded-xl bg-white text-stone-900 font-bold text-xs flex items-center justify-center hover:bg-stone-200 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-stone-950 font-mono px-2">
                      {participants} Orang
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setParticipants((p) =>
                          Math.min(departure ? departure.remainingSlots : 15, p + 1)
                        )
                      }
                      disabled={departure ? participants >= departure.remainingSlots : participants >= 15}
                      className="w-8 h-8 rounded-xl bg-white text-stone-900 font-bold text-xs flex items-center justify-center hover:bg-stone-200 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Book Contact Details Form */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-950 flex items-center gap-2">
                      <User size={18} className="text-stone-700" />
                      <span>Data Pemesan Utama</span>
                    </h3>
                    <p className="text-stone-400 text-xs mt-0.5">
                      E-tiket dan konfirmasi jadwal akan dikirimkan ke kontak ini.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                    Akun Terverifikasi
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 mb-1.5">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Sesuai KTP / Paspor"
                      className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold text-stone-950 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                        formErrors.name ? 'border-rose-500' : 'border-stone-200'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        Alamat Email Aktif *
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                          placeholder="nama@email.com"
                          className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-stone-950 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                            formErrors.email ? 'border-rose-500' : 'border-stone-200'
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-900 mb-1.5">
                        No. WhatsApp / Telepon *
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                          placeholder="081234567890"
                          className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-stone-950 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                            formErrors.phone ? 'border-rose-500' : 'border-stone-200'
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-rose-600 text-[11px] font-semibold mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Traveler Roster (All Pax) */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-950 flex items-center gap-2">
                      <Users size={18} className="text-stone-700" />
                      <span>Daftar Tamu / Penumpang ({participants} Orang)</span>
                    </h3>
                    <p className="text-stone-400 text-xs mt-0.5">
                      Identitas diperlukan untuk asuransi dan boarding transportasi perjalanan.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {passengers.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF9F6] border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Tamu {idx + 1} {idx === 0 && <span className="text-stone-400 font-normal">(Pemesan Utama)</span>}
                        </span>
                        {idx === 0 && (
                          <button
                            type="button"
                            onClick={copyLeadBooker}
                            className="text-[11px] font-bold text-stone-700 hover:text-stone-950 underline cursor-pointer"
                          >
                            Sama dengan data pemesan
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                            Panggilan
                          </label>
                          <select
                            value={p.title}
                            onChange={(e) => updatePassenger(idx, 'title', e.target.value as any)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer"
                          >
                            <option value="Tn.">Tn. (Tuan)</option>
                            <option value="Ny.">Ny. (Nyonya)</option>
                            <option value="Nn.">Nn. (Nona)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                            Nama Lengkap *
                          </label>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                            placeholder="Sesuai KTP / Paspor"
                            className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                              formErrors.passengers?.[idx]?.name ? 'border-rose-500' : 'border-stone-200'
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                            No. KTP / Paspor
                          </label>
                          <input
                            type="text"
                            value={p.idNumber}
                            onChange={(e) => updatePassenger(idx, 'idNumber', e.target.value)}
                            placeholder="Nomor identitas resmi"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-900"
                          />
                        </div>
                      </div>

                      {formErrors.passengers?.[idx]?.name && (
                        <p className="text-rose-600 text-[11px] font-semibold">
                          {formErrors.passengers[idx]?.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests / Notes */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-stone-900">
                  Permintaan Khusus & Kebutuhan Diet (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={contact.notes}
                  onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                  placeholder="Contoh: Menu makanan vegetarian/halal, twin bed, kursi roda, atau koordinasi penerbangan tiba..."
                  className="w-full border border-stone-200 rounded-2xl p-3.5 text-xs font-medium text-stone-950 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                />
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setCurrentStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className="w-full bg-stone-900 hover:bg-black text-white font-bold py-4 rounded-full transition-all text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Lanjut ke Perlindungan & Add-ons</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ──────── STEP 2: Perlindungan & Add-ons ──────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 space-y-6 shadow-2xs">
                <div>
                  <h3 className="text-base font-bold text-stone-950 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#C29B38]" />
                    <span>Perlindungan Perjalanan & Layanan Eksklusif</span>
                  </h3>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Tingkatkan kenyamanan dan rasa aman selama berlibur bersama NOVA.
                  </p>
                </div>

                {/* Insurance Option */}
                <div
                  onClick={() => setIncludeInsurance(!includeInsurance)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    includeInsurance
                      ? 'border-stone-900 bg-[#F5F2EB]/50 ring-1 ring-stone-900/10'
                      : 'border-stone-200/80 bg-white hover:border-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 ${
                      includeInsurance ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'
                    }`}
                  >
                    {includeInsurance && <Check size={13} className="stroke-[3]" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-stone-950">
                        NOVA Total Care Travel Protection (Rekomendasi)
                      </p>
                      <span className="text-xs font-bold text-stone-950 font-serif-luxury shrink-0">
                        +{formatIDR(insurancePerPerson)} / pax
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Perlindungan asuransi kecelakaan, santunan keterlambatan bagasi hingga 24 jam,
                      serta ganti rugi medis darurat internasional.
                    </p>
                  </div>
                </div>

                {/* VIP Airport Concierge Option */}
                <div
                  onClick={() => setIncludeVipConcierge(!includeVipConcierge)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    includeVipConcierge
                      ? 'border-stone-900 bg-[#F5F2EB]/50 ring-1 ring-stone-900/10'
                      : 'border-stone-200/80 bg-white hover:border-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 ${
                      includeVipConcierge ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'
                    }`}
                  >
                    {includeVipConcierge && <Check size={13} className="stroke-[3]" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-stone-950">
                        VIP Airport Fast-Track & Private Concierge
                      </p>
                      <span className="text-xs font-bold text-stone-950 font-serif-luxury shrink-0">
                        +{formatIDR(vipConciergeFee)} / grup
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Pendampingan staf bandara di gate kedatangan, bantuan bagasi VIP, serta jalur imigrasi ekspres
                      khusus traveler NOVA.
                    </p>
                  </div>
                </div>

                {/* Guarantee Note */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 flex items-center gap-3 text-xs text-stone-600">
                  <HeartHandshake size={20} className="text-[#C29B38] shrink-0" />
                  <span>
                    Seluruh paket wisata telah mencakup <strong>Garansi Keberangkatan 100%</strong> dan
                    bantuan darurat 24 jam tim lapangan NOVA.
                  </span>
                </div>
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-bold py-3.5 rounded-full transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                  <span>Kembali ke Data Tamu</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex-1 bg-stone-900 hover:bg-black text-white font-bold py-3.5 rounded-full transition-all text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Tinjau Ringkasan Akhir</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 3: Tinjauan & Kebijakan Pembatalan ──────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 space-y-5 shadow-2xs">
                <h3 className="text-base font-bold text-stone-950 flex items-center gap-2 pb-3 border-b border-stone-100">
                  <Sparkles size={18} className="text-[#C29B38]" />
                  <span>Tinjauan Detail Perjalanan</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Paket Wisata</span>
                    <span className="font-bold text-stone-900">{pkg.title}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Jadwal Keberangkatan</span>
                    <span className="font-bold text-stone-900">
                      {departure
                        ? `${new Date(departure.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} s.d ${new Date(departure.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : customDate}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Jumlah Wisatawan</span>
                    <span className="font-bold text-stone-900">{participants} Orang</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Pemesan Utama</span>
                    <span className="font-bold text-stone-900">{contact.name} ({contact.phone})</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-500">Add-ons Terpilih</span>
                    <span className="font-bold text-stone-900 text-right">
                      {[
                        includeInsurance ? 'Asuransi Total Care' : null,
                        includeVipConcierge ? 'VIP Concierge' : null,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'Hanya Paket Standar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy Box */}
              <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                  <ShieldCheck size={16} className="text-[#C29B38]" />
                  <span>Kebijakan Pembatalan & Pengembalian Dana</span>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-600 leading-relaxed font-normal">
                  <li>• Pembatalan lebih dari 30 hari sebelum keberangkatan: Pengembalian dana 100% penuh.</li>
                  <li>• Pembatalan 15 hingga 30 hari sebelum keberangkatan: Pengembalian dana 50%.</li>
                  <li>• Pembatalan kurang dari 15 hari: Tiket hangus (dapat dialihkan ke nama traveler lain).</li>
                </ul>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-stone-200/80 cursor-pointer shadow-2xs">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-stone-900 accent-stone-900 cursor-pointer"
                />
                <span className="text-xs text-stone-600 leading-relaxed">
                  Saya menyatakan bahwa data yang diisi telah sesuai dengan kartu identitas resmi, serta
                  menyetujui <Link href="/terms" className="underline text-stone-900 font-bold" target="_blank">Syarat & Ketentuan</Link> dan <Link href="/privacy" className="underline text-stone-900 font-bold" target="_blank">Kebijakan Privasi</Link> NOVA.
                </span>
              </label>

              {/* Final Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-bold py-4 rounded-full transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                  <span>Ubah Add-ons</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={!agreedTerms || submitting}
                  className="flex-1 bg-stone-900 hover:bg-black disabled:opacity-40 text-white font-bold py-4 rounded-full transition-all text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CreditCard size={16} className="text-[#C29B38]" />
                  <span>{submitting ? 'Menyiapkan Tagihan...' : 'Lanjut ke Pembayaran Aman'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary & Price Breakdown (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
          <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs">
            {/* Photo & Package Header */}
            <div className="relative h-44 overflow-hidden bg-stone-900">
              <Image
                src={pkg.coverImage || pkg.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000'}
                alt={pkg.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-stone-900/90 text-white backdrop-blur-xs">
                {pkg.category || 'Luxury Expedition'}
              </span>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h4 className="text-sm font-bold leading-snug">{pkg.title}</h4>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {departure
                    ? new Date(departure.startDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : customDate || 'Tanggal Fleksibel'}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Voucher Promo Section */}
              <div className="space-y-2 pb-4 border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Tag size={13} className="text-[#C29B38]" />
                    <span>Kode Kupon Promo</span>
                  </label>
                  <button
                    type="button"
                    onClick={openCouponPicker}
                    className="text-[11px] font-bold text-stone-700 hover:text-black underline cursor-pointer"
                  >
                    Daftar Promo
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="MASUKKAN KODE"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-950 uppercase placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-[#FAF9F6]"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon()}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-black transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    {couponLoading ? '...' : 'Gunakan'}
                  </button>
                </div>

                {appliedCoupon && (
                  <p
                    className={`text-xs font-bold mt-1 ${
                      appliedCoupon.valid ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {appliedCoupon.valid
                      ? `Kupon ${appliedCoupon.code} berhasil memotong ${formatIDR(appliedCoupon.discount_amount || 0)}`
                      : appliedCoupon.message}
                  </p>
                )}
              </div>

              {/* Price Breakdown Line Items */}
              <div className="space-y-2.5 text-xs font-medium text-stone-600">
                <div className="flex justify-between">
                  <span>Tiket Wisata ({participants} orang)</span>
                  <span className="font-bold text-stone-900">{formatIDR(subtotal)}</span>
                </div>

                {includeInsurance && (
                  <div className="flex justify-between text-stone-600">
                    <span>Asuransi Total Care ({participants} orang)</span>
                    <span className="font-bold text-stone-900">{formatIDR(insuranceTotal)}</span>
                  </div>
                )}

                {includeVipConcierge && (
                  <div className="flex justify-between text-stone-600">
                    <span>VIP Concierge & Fast-track</span>
                    <span className="font-bold text-stone-900">{formatIDR(conciergeTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-500">
                  <span>Biaya Layanan & Pajak</span>
                  <span className="font-bold text-stone-900">{formatIDR(serviceFee)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Potongan Kupon Promo</span>
                    <span>- {formatIDR(discountTotal)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Total Pembayaran
                  </p>
                  <p className="text-xl font-bold text-stone-950 font-serif-luxury">
                    {formatIDR(grandTotal)}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                  Harga Final Transparan
                </span>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium text-center">
                <Lock size={12} className="text-[#C29B38]" />
                <span>Transaksi dienkripsi 256-bit SSL tingkat perbankan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Coupons Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
                  <Ticket size={16} className="text-[#C29B38]" />
                  <span>Kupon Promo Tersedia</span>
                </h3>
                <p className="text-stone-400 text-xs">Pilih voucher untuk langsung memotong biaya</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {loadingAvailableCoupons ? (
              <p className="text-center py-8 text-xs text-stone-400">Memuat voucher promo...</p>
            ) : availableCoupons.filter((c) => c.is_active).length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-xs font-bold text-stone-800">Tidak ada voucher promo aktif saat ini</p>
                <p className="text-[11px] text-stone-400">Nantikan diskon menarik berikutnya dari NOVA.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableCoupons
                  .filter((c) => c.is_active)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-stone-200/90 hover:border-stone-900 transition-all flex items-center justify-between gap-3 bg-[#FAF9F6]"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-stone-950 bg-stone-200/80 px-2 py-0.5 rounded-md tracking-wider">
                            {c.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                            {c.discount_type === 'percent'
                              ? `${c.discount_value}% OFF`
                              : `Hemat ${formatIDR(c.discount_value)}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium">
                          Min. transaksi {formatIDR(c.min_amount || 0)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponInput(c.code)
                          setShowCouponModal(false)
                          applyCoupon(c.code)
                        }}
                        className="shrink-0 bg-stone-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer"
                      >
                        Pakai
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}