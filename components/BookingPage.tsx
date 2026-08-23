'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Clock,
  Users,
  Star,
  Search,
  Tag,
  Calendar,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  FileText,
  CreditCard,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabaseClient } from '@/lib/supabase-client'
import { formatIDR } from '@/lib/types'
import gsap from 'gsap'

interface Package {
  id: number
  slug?: string
  tag: string
  tagColor: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice: number
  duration: string
  groupSize: string
  rating: number
  reviews: number
  includes: string[]
  highlight: string
  category: string
}

interface BookingForm {
  name: string
  email: string
  phone: string
  travelDate: string
  participants: number
  notes: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  travelDate?: string
  participants?: string
}

const STEPS = [
  { id: 'dest', label: 'Pilih Destinasi', icon: MapPin },
  { id: 'pkg', label: 'Pilih Paket', icon: Sparkles },
  { id: 'details', label: 'Data Pemesan', icon: User },
]

const BookingPageInner: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    participants: 1,
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherResult, setVoucherResult] = useState<{
    valid: boolean
    message?: string
    code?: string
    discount_type?: string
    discount_value?: number
    discount_amount?: number
    discounted_amount?: number
  } | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [matchedPackages, setMatchedPackages] = useState<Package[] | null>(null)
  const [noMatchesFound, setNoMatchesFound] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabaseClient.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (!data.user) {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      } else {
        const user = data.user
        setForm((prev) => ({
          ...prev,
          name: prev.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || user.user_metadata?.phone || '',
        }))
      }
    })

    const fetchPackages = fetch('/api/packages').then((r) => r.json())
    const fetchDests = fetch('/api/destinations').then((r) => r.json()).catch(() => [])

    Promise.all([fetchPackages, fetchDests])
      .then(([pkgsData, destsData]) => {
        let loadedPackages: Package[] = []
        if (Array.isArray(pkgsData)) {
          setPackages(pkgsData)
          loadedPackages = pkgsData
        }

        const paramId = searchParams.get('packageId')
        const destQuery = searchParams.get('destination')

        if (paramId && loadedPackages.length > 0) {
          const found = loadedPackages.find((p) => String(p.id) === paramId)
          if (found) {
            setSelectedPackage(found)
            setSelectedCountry(found.category)
            setStep(2)
            return
          }
        }

        if (destQuery && loadedPackages.length > 0) {
          const matchedDest = Array.isArray(destsData)
            ? destsData.find(
                (d) =>
                  (d.city || '').toLowerCase() === destQuery.toLowerCase() ||
                  (d.country || '').toLowerCase() === destQuery.toLowerCase() ||
                  destQuery.toLowerCase().includes((d.city || '').toLowerCase()) ||
                  (d.city || '').toLowerCase().includes(destQuery.toLowerCase())
              )
            : null

          const searchTerms = [destQuery.toLowerCase()]
          if (matchedDest) {
            if (matchedDest.city) searchTerms.push(matchedDest.city.toLowerCase())
            if (matchedDest.country) searchTerms.push(matchedDest.country.toLowerCase())
          }

          const filtered = loadedPackages.filter((p) => {
            const title = (p.title || '').toLowerCase()
            const subtitle = (p.subtitle || '').toLowerCase()
            const highlight = (p.highlight || '').toLowerCase()
            const category = (p.category || '').toLowerCase()

            return searchTerms.some(
              (term) =>
                title.includes(term) ||
                subtitle.includes(term) ||
                highlight.includes(term) ||
                category.includes(term)
            )
          })

          if (filtered.length > 0) {
            setMatchedPackages(filtered)
            setSelectedCountry(matchedDest ? `${matchedDest.city}, ${matchedDest.country}` : destQuery)
            setStep(1)
          } else {
            setNoMatchesFound(true)
            setMatchedPackages(loadedPackages)
            setSelectedCountry(destQuery)
            setStep(1)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [searchParams, router])

  // GSAP Smooth Step Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-booking-step',
        { opacity: 0, y: 22, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      )
      gsap.fromTo(
        '.gsap-booking-sidebar',
        { opacity: 0, x: 25 },
        { opacity: 1, x: 0, duration: 0.55, delay: 0.08, ease: 'power3.out' }
      )
    })
    return () => ctx.revert()
  }, [step])

  const countries = Array.from(new Set(packages.map((p) => p.category))).filter(Boolean)
  const filteredCountries = countries.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
  const filteredPackages = packages.filter((p) => p.category === selectedCountry)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.name === 'participants' ? parseInt(e.target.value) || 1 : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: val }))
    if (formErrors[e.target.name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    if (!form.name.trim()) errors.name = 'Nama lengkap wajib diisi'
    if (!form.email.trim() || !form.email.includes('@')) errors.email = 'Email tidak valid'
    if (!form.phone.trim() || form.phone.length < 8) errors.phone = 'Nomor WhatsApp / telepon wajib diisi'
    if (!form.travelDate) errors.travelDate = 'Pilih tanggal keberangkatan'
    if (!form.participants || form.participants < 1) errors.participants = 'Minimal 1 peserta'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleVoucherApply = async () => {
    if (!voucherCode.trim() || !selectedPackage) return
    setVoucherLoading(true)
    setVoucherResult(null)
    try {
      const subtotal = selectedPackage.price * form.participants
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim(), amount: subtotal }),
      })
      const data = await res.json()
      setVoucherResult(data)
      if (data.valid) {
        setDiscountAmount(data.discount_amount ?? 0)
      } else {
        setDiscountAmount(0)
      }
    } catch {
      setVoucherResult({ valid: false, message: 'Gagal memvalidasi voucher' })
      setDiscountAmount(0)
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage) return
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const subtotal = selectedPackage.price * form.participants
      const finalTotal = Math.max(0, subtotal - discountAmount)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          packageName: selectedPackage.title,
          country: selectedCountry,
          ...form,
          voucherCode: voucherResult?.valid ? voucherResult.code : undefined,
          discountAmount,
          totalAmount: finalTotal,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push('/payment/confirmation/' + data.id)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-28 pb-16">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-xl border border-neutral-200/90 space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-jakarta font-black text-neutral-950 mb-2">
                Pemesanan Berhasil!
              </h2>
              <p className="text-neutral-500 font-jakarta text-sm">
                Terima kasih, <strong className="text-neutral-900">{form.name}</strong>. Rincian e-tiket telah dikirimkan ke <strong className="text-neutral-900">{form.email}</strong>.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-5 text-left space-y-2.5 border border-neutral-200/70 font-jakarta text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400 font-medium">Paket</span>
                <span className="font-bold text-neutral-900">{selectedPackage?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-medium">Destinasi</span>
                <span className="font-bold text-neutral-900">{selectedCountry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-medium">Tanggal</span>
                <span className="font-bold text-neutral-900">{form.travelDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-medium">Peserta</span>
                <span className="font-bold text-neutral-900">{form.participants} Orang</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-neutral-200 font-bold text-sm">
                <span className="text-neutral-900">Total Pembayaran</span>
                <span className="text-emerald-600">
                  {selectedPackage ? formatIDR(selectedPackage.price * form.participants - discountAmount) : formatIDR(0)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="w-full bg-neutral-950 text-white font-jakarta font-extrabold py-3.5 rounded-xl hover:bg-black transition-all text-sm shadow-md active:scale-95 cursor-pointer"
            >
              Lihat Tiket di Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-neutral-900">
      <Navbar />
      <div className="flex-1 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header & Back Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => (step === 0 ? router.push('/') : setStep((s) => s - 1))}
                className="inline-flex items-center gap-2 text-xs font-jakarta font-bold text-neutral-500 hover:text-neutral-950 transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{step === 0 ? 'Kembali ke Beranda' : 'Kembali ke Langkah Sebelumnya'}</span>
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-jakarta font-black text-neutral-950 tracking-tight">
                Pemesanan Perjalanan Nova
              </h1>
              <p className="text-neutral-500 font-jakarta text-xs sm:text-sm font-normal mt-1">
                Lengkapi langkah mudah untuk mengamankan slot perjalanan impianmu.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2 text-emerald-800 text-xs font-jakarta font-bold self-start">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Garansi Keberangkatan 100%</span>
            </div>
          </div>

          {/* Step Progress Navigation Bar */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-3 shadow-2xs">
            <div className="grid grid-cols-3 gap-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isCurrent = i === step
                const isPast = i < step
                return (
                  <button
                    key={s.id}
                    disabled={i > step && !selectedPackage}
                    onClick={() => {
                      if (i < step || (i === 1 && selectedCountry) || (i === 2 && selectedPackage)) {
                        setStep(i)
                      }
                    }}
                    className={`flex items-center justify-center sm:justify-start gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-jakarta font-bold transition-all ${
                      isCurrent
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : isPast
                        ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 cursor-pointer'
                        : 'text-neutral-400 bg-transparent cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-extrabold ${
                        isCurrent
                          ? 'bg-white text-neutral-950'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {isPast ? <Check size={12} className="stroke-[3]" /> : i + 1}
                    </div>
                    <span className="hidden sm:inline truncate">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─── Step 0: Destination Selection ─── */}
          {step === 0 && (
            <div className="gsap-booking-step space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari destinasi atau negara impianmu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-200/90 rounded-2xl text-xs sm:text-sm font-jakarta font-bold text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 shadow-2xs"
                />
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-neutral-200/60 rounded-2xl h-36 animate-pulse" />
                  ))}
                </div>
              ) : filteredCountries.length === 0 ? (
                <div className="text-center py-16 text-neutral-400 text-xs font-jakarta font-bold bg-white rounded-3xl border border-neutral-200/90">
                  Tidak ada destinasi yang cocok dengan kata kunci tersebut.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredCountries.map((country) => {
                    const count = packages.filter((p) => p.category === country).length
                    const thumb = packages.find((p) => p.category === country)?.image
                    return (
                      <button
                        key={country}
                        onClick={() => {
                          setSelectedCountry(country)
                          setMatchedPackages(null)
                          setNoMatchesFound(false)
                          setStep(1)
                        }}
                        className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200/90 hover:border-neutral-950 hover:shadow-lg transition-all duration-300 text-left h-36 cursor-pointer active:scale-95"
                      >
                        {thumb && (
                          <img
                            src={thumb}
                            alt={country}
                            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                        <div className="relative p-5 h-full flex flex-col justify-between z-10">
                          <div className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xs">
                            <MapPin className="w-4 h-4 text-neutral-900" />
                          </div>
                          <div>
                            <p className="font-jakarta font-black text-sm sm:text-base text-neutral-950 leading-tight">
                              {country}
                            </p>
                            <p className="text-[11px] font-jakarta font-bold text-neutral-500 mt-1">
                              {count} pilihan paket
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Step 1: Package Selection ─── */}
          {step === 1 && (
            <div className="gsap-booking-step space-y-6">
              {noMatchesFound ? (
                <div className="text-xs font-jakarta text-neutral-700 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 leading-relaxed">
                  Belum ada paket spesifik untuk <strong>{selectedCountry}</strong>. Silakan pilih dari pilihan paket terpopuler kami di bawah:
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-jakarta font-bold text-neutral-500">
                    Menampilkan paket wisata untuk <strong className="text-neutral-950">{selectedCountry}</strong>
                  </p>
                  <button
                    onClick={() => setStep(0)}
                    className="text-xs font-jakarta font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Ganti Destinasi
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                {(matchedPackages || filteredPackages).map((pkg, idx) => (
                  <div
                    key={pkg.slug || pkg.id || `booking-pkg-${idx}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-neutral-200/90 hover:border-neutral-950 hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between"
                  >
                    <div className="relative h-48 overflow-hidden bg-neutral-900">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 img-smooth-zoom"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className={`absolute top-3 left-3 text-[10px] font-jakarta font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs ${pkg.tagColor || 'bg-white text-neutral-950'}`}>
                        {pkg.tag || 'Popular'}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-jakarta font-extrabold text-base text-neutral-950 mb-1 leading-snug">
                          {pkg.title}
                        </h3>
                        <p className="font-jakarta text-xs text-neutral-500 mb-3 line-clamp-2">
                          {pkg.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-3 text-[11px] font-jakarta font-semibold text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {pkg.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            {pkg.groupSize}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {pkg.rating} ({pkg.reviews})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div>
                          <p className="text-[10px] font-jakarta font-bold text-neutral-400 uppercase tracking-wider">Harga Mulai</p>
                          <p className="font-jakarta font-black text-base text-neutral-950">{formatIDR(pkg.price)}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPackage(pkg)
                            setStep(2)
                          }}
                          className="bg-neutral-950 text-white text-xs font-jakarta font-extrabold px-4 py-2.5 rounded-xl hover:bg-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          <span>Pilih Paket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Step 2: Traveler Details & Instant Order Summary ─── */}
          {step === 2 && selectedPackage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <form onSubmit={handleSubmit} className="gsap-booking-step lg:col-span-7 bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-jakarta font-black text-lg text-neutral-950 flex items-center gap-2">
                    <User size={18} className="text-neutral-800" />
                    <span>Informasi Pemesan Utama</span>
                  </h3>
                  <p className="text-neutral-500 font-jakarta text-xs mt-0.5">
                    Data ini digunakan untuk pengiriman e-tiket dan verifikasi di lokasi.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-jakarta font-bold text-neutral-900 mb-1.5">
                      Nama Lengkap (sesuai KTP/Paspor) *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Contoh: Alexander Pratama"
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs font-jakarta font-bold text-neutral-950 bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 ${
                          formErrors.name ? 'border-rose-500' : 'border-neutral-200'
                        }`}
                      />
                    </div>
                    {formErrors.name && <p className="text-rose-600 text-[11px] font-jakarta font-semibold mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-jakarta font-bold text-neutral-900 mb-1.5">Email Aktif *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleFormChange}
                          placeholder="nama@email.com"
                          className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs font-jakarta font-bold text-neutral-950 bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 ${
                            formErrors.email ? 'border-rose-500' : 'border-neutral-200'
                          }`}
                        />
                      </div>
                      {formErrors.email && <p className="text-rose-600 text-[11px] font-jakarta font-semibold mt-1">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-jakarta font-bold text-neutral-900 mb-1.5">No. WhatsApp / Telepon *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleFormChange}
                          placeholder="081234567890"
                          className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs font-jakarta font-bold text-neutral-950 bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 ${
                            formErrors.phone ? 'border-rose-500' : 'border-neutral-200'
                          }`}
                        />
                      </div>
                      {formErrors.phone && <p className="text-rose-600 text-[11px] font-jakarta font-semibold mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  {/* Travel Date & Participant Counter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-jakarta font-bold text-neutral-900 mb-1.5">Tanggal Keberangkatan *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          name="travelDate"
                          type="date"
                          value={form.travelDate}
                          onChange={handleFormChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-jakarta font-bold text-neutral-950 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950/20 cursor-pointer ${
                            formErrors.travelDate ? 'border-rose-500' : 'border-neutral-200'
                          }`}
                        />
                      </div>
                      {formErrors.travelDate && <p className="text-rose-600 text-[11px] font-jakarta font-semibold mt-1">{formErrors.travelDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-jakarta font-bold text-neutral-900 mb-1.5">Jumlah Peserta *</label>
                      <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-1.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, participants: Math.max(1, prev.participants - 1) }))}
                          className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold text-xs transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-xs font-jakarta font-extrabold text-neutral-950">{form.participants} Orang</span>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, participants: Math.min(20, prev.participants + 1) }))}
                          className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-900 font-bold text-xs transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-jakarta font-bold text-neutral-900 mb-1.5">Catatan Khusus (opsional)</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                      placeholder="Contoh: Makanan halal, vegetarian, ranjang double bed, penjemputan bandara..."
                      rows={3}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-jakarta font-medium text-neutral-950 bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-neutral-950 text-white font-jakarta font-extrabold py-4 rounded-2xl hover:bg-black disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2 shadow-xl shadow-neutral-950/15 active:scale-[0.99] cursor-pointer"
                >
                  <CreditCard size={18} className="text-amber-400" />
                  <span>{submitting ? 'Memproses Pesanan...' : 'Lanjut ke Pembayaran'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Order Summary Sidebar */}
              <div className="gsap-booking-sidebar lg:col-span-5 space-y-4 lg:sticky lg:top-28">
                <div className="bg-white rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm">
                  {/* Photo Header */}
                  <div className="relative h-40 overflow-hidden bg-neutral-900">
                    <Image src={selectedPackage.image} alt={selectedPackage.title} fill className="object-cover img-smooth-zoom" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className={`absolute top-3 left-3 text-[10px] font-jakarta font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs ${selectedPackage.tagColor || 'bg-white text-neutral-950'}`}>
                      {selectedPackage.tag || 'Selected'}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-jakarta font-bold text-sm leading-snug">{selectedPackage.title}</h4>
                      <p className="text-[11px] text-white/80 font-medium">{selectedCountry}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Includes Checklist */}
                    {selectedPackage.includes && selectedPackage.includes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-jakarta font-bold uppercase tracking-wider text-neutral-400">
                          Sudah Termasuk
                        </p>
                        <ul className="space-y-1.5">
                          {selectedPackage.includes.slice(0, 4).map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs font-jakarta text-neutral-600 font-medium">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Voucher Box */}
                    <div className="pt-3 border-t border-neutral-100 space-y-2">
                      <p className="text-xs font-jakarta font-bold text-neutral-900 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kupon & Diskon Promo</span>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => {
                            setVoucherCode(e.target.value.toUpperCase())
                            if (voucherResult) {
                              setVoucherResult(null)
                              setDiscountAmount(0)
                            }
                          }}
                          placeholder="KODE PROMO"
                          className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-jakarta font-bold text-neutral-950 uppercase placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 bg-neutral-50"
                        />
                        <button
                          type="button"
                          onClick={handleVoucherApply}
                          disabled={voucherLoading || !voucherCode.trim()}
                          className="px-4 py-2 bg-neutral-950 text-white text-xs font-jakarta font-bold rounded-xl disabled:opacity-40 hover:bg-black transition-all shrink-0 cursor-pointer"
                        >
                          {voucherLoading ? '...' : 'Gunakan'}
                        </button>
                      </div>
                      {voucherResult && (
                        <p className={`text-xs font-jakarta font-bold ${voucherResult.valid ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {voucherResult.valid
                            ? `Diskon ${formatIDR(voucherResult.discount_amount || discountAmount)} aktif!`
                            : voucherResult.message}
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="pt-3 border-t border-neutral-100 space-y-2 font-jakarta text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Harga Paket ({form.participants} Orang)</span>
                        <span className="font-bold text-neutral-900">{formatIDR(selectedPackage.price * form.participants)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Diskon Promo ({voucherCode})</span>
                          <span>− {formatIDR(discountAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Grand Total */}
                    <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-jakarta font-bold uppercase tracking-wider text-neutral-400">Total Tagihan</p>
                        <p className="text-lg font-jakarta font-black text-neutral-950">
                          {formatIDR(Math.max(0, selectedPackage.price * form.participants - discountAmount))}
                        </p>
                      </div>
                      <span className="text-[10px] font-jakarta font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                        Bebas Biaya Admin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

const BookingPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-950 rounded-full animate-spin" />
          </div>
          <Footer />
        </div>
      }
    >
      <BookingPageInner />
    </Suspense>
  )
}

export default BookingPage
