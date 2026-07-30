'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, MapPin, Clock, Users, Star, Search, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabaseClient } from '@/lib/supabase-client'

interface Package {
  id: number
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

const STEPS = ['Destination', 'Package', 'Details']

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
  const [form, setForm] = useState<BookingForm>({ name: '', email: '', phone: '', travelDate: '', participants: 1, notes: '' })
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
    // 1. Force authentication to book — middleware is the first line of defence,
    //    this client guard is a belt-and-suspenders fallback.
    supabaseClient.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      if (!data.user) {
        router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      }
    })

    const fetchPackages = fetch('/api/packages').then(r => r.json())
    const fetchDests = fetch('/api/destinations').then(r => r.json()).catch(() => [])

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
          const found = loadedPackages.find(p => String(p.id) === paramId)
          if (found) {
            setSelectedPackage(found)
            setSelectedCountry(found.category)
            setStep(2)
            return
          }
        }

        if (destQuery && loadedPackages.length > 0) {
          // Find matched destination
          const matchedDest = Array.isArray(destsData)
            ? destsData.find(d =>
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

          // Filter packages by search terms
          const filtered = loadedPackages.filter(p => {
            const title = (p.title || '').toLowerCase()
            const subtitle = (p.subtitle || '').toLowerCase()
            const highlight = (p.highlight || '').toLowerCase()
            const category = (p.category || '').toLowerCase()

            return searchTerms.some(term =>
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
            // No specific package matches
            setNoMatchesFound(true)
            setMatchedPackages(loadedPackages) // Show all packages as fallback
            setSelectedCountry(destQuery)
            setStep(1)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [searchParams, router])

  const countries = Array.from(new Set(packages.map(p => p.category))).filter(Boolean)
  const filteredCountries = countries.filter(c => c.toLowerCase().includes(search.toLowerCase()))
  const filteredPackages = packages.filter(p => p.category === selectedCountry)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.name === 'participants' ? (parseInt(e.target.value) || 1) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
    // Clear error on change
    if (formErrors[e.target.name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    if (!form.name.trim()) errors.name = 'Full name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    if (!form.phone.trim()) errors.phone = 'Phone number is required'
    if (!form.travelDate) errors.travelDate = 'Travel date is required'
    if (!form.participants || form.participants < 1) errors.participants = 'At least 1 participant required'
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
      setVoucherResult({ valid: false, message: 'Gagal menghubungi server.' })
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
        router.push('/payment/' + data.id)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm border border-black/[0.04]">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>Booking Confirmed!</h2>
            <p className="text-black/50 text-sm mb-2">Thank you, <span className="text-black font-medium">{form.name}</span>.</p>
            <p className="text-black/50 text-sm mb-8">Confirmation sent to <span className="text-black font-medium">{form.email}</span>.</p>
            <div className="bg-[#F5F5F5] rounded-2xl p-5 text-left mb-8 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-black/50">Package</span><span className="font-medium">{selectedPackage?.title}</span></div>
              <div className="flex justify-between text-sm"><span className="text-black/50">Destination</span><span className="font-medium">{selectedCountry}</span></div>
              <div className="flex justify-between text-sm"><span className="text-black/50">Date</span><span className="font-medium">{form.travelDate}</span></div>
              <div className="flex justify-between text-sm"><span className="text-black/50">Participants</span><span className="font-medium">{form.participants} person{form.participants !== 1 ? 's' : ''}</span></div>
              <div className="flex justify-between text-sm pt-2 border-t border-black/5"><span className="text-black/50">Total</span><span className="font-bold">${selectedPackage ? (selectedPackage.price * form.participants).toLocaleString() : 0}</span></div>
            </div>
            <button onClick={() => router.push('/')} className="w-full bg-black text-white font-medium py-3 rounded-full hover:bg-black/80 transition-colors text-sm">Back to Home</button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <button onClick={() => step === 0 ? router.push('/') : setStep(s => s - 1)} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? 'Back to Home' : 'Back'}
            </button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ letterSpacing: '-0.03em' }}>Book Your Trip</h1>
            <p className="text-black/50 text-sm">Choose your dream destination and start your adventure.</p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-black text-white' : i === step ? 'bg-black text-white ring-4 ring-black/10' : 'bg-black/10 text-black/30'}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-black' : 'text-black/30'}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-black' : 'bg-black/10'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Select Destination */}
          {step === 0 && (
            <div>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input type="text" placeholder="Search destinations..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/[0.06] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-black/30" />
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
              ) : filteredCountries.length === 0 ? (
                <div className="text-center py-16 text-black/30 text-sm">No destinations found.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredCountries.map(country => {
                    const count = packages.filter(p => p.category === country).length
                    const thumb = packages.find(p => p.category === country)?.image
                    return (
                      <button key={country} onClick={() => { setSelectedCountry(country); setMatchedPackages(null); setNoMatchesFound(false); setStep(1) }} className="group relative bg-white rounded-2xl overflow-hidden border border-black/[0.04] hover:shadow-lg transition-all duration-300 text-left h-36">
                        {thumb && <img src={thumb} alt={country} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" />}
                        <div className="relative p-5 h-full flex flex-col justify-between">
                          <MapPin className="w-5 h-5 text-black/40" />
                          <div>
                            <p className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.02em' }}>{country}</p>
                            <p className="text-xs text-black/40 mt-0.5">{count} package{count !== 1 ? 's' : ''} available</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Select Package */}
          {step === 1 && (
            <div>
              {noMatchesFound ? (
                <p className="text-sm text-neutral-600 mb-6 bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
                  Maaf, belum tersedia paket khusus untuk <span className="font-semibold text-black">{selectedCountry}</span>.
                  Silakan pilih paket perjalanan terbaik kami lainnya di bawah ini:
                </p>
              ) : (
                <p className="text-sm text-black/40 mb-6">Showing packages for <span className="text-black font-medium">{selectedCountry}</span></p>
              )}
              <div className="grid md:grid-cols-2 gap-5">
                {(matchedPackages || filteredPackages).map(pkg => (
                  <button key={pkg.id} onClick={() => { setSelectedPackage(pkg); setStep(2) }} className="group bg-white rounded-3xl overflow-hidden border border-black/[0.04] hover:shadow-xl transition-all duration-300 text-left flex flex-col">
                    <div className="relative h-44 overflow-hidden">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor}`}>{pkg.tag}</span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base mb-1" style={{ letterSpacing: '-0.02em' }}>{pkg.title}</h3>
                        <p className="text-xs text-black/40 mb-3">{pkg.subtitle}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-black/50 mb-4">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.duration}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pkg.groupSize}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{pkg.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-black/5">
                        <div><span className="font-bold text-lg">${pkg.price.toLocaleString()}</span><span className="text-xs text-black/30 ml-1">/person</span></div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-black bg-black/5 px-3 py-1.5 rounded-full group-hover:bg-black group-hover:text-white transition-colors">Select <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Form Details */}
          {step === 2 && selectedPackage && (
            <div className="grid md:grid-cols-5 gap-8">
              <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleFormChange} placeholder="Your name" className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20 ${formErrors.name ? 'border-red-400' : 'border-black/10'}`} />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="you@example.com" className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20 ${formErrors.email ? 'border-red-400' : 'border-black/10'}`} />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Phone *</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleFormChange} placeholder="+1 ..." className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20 ${formErrors.phone ? 'border-red-400' : 'border-black/10'}`} />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Travel Date *</label>
                    <input name="travelDate" type="date" value={form.travelDate} onChange={handleFormChange} min={new Date().toISOString().split('T')[0]} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white ${formErrors.travelDate ? 'border-red-400' : 'border-black/10'}`} />
                    {formErrors.travelDate && <p className="text-red-500 text-xs mt-1">{formErrors.travelDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Participants *</label>
                    <input name="participants" type="number" value={form.participants} onChange={handleFormChange} min={1} max={20} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white ${formErrors.participants ? 'border-red-400' : 'border-black/10'}`} />
                    {formErrors.participants && <p className="text-red-500 text-xs mt-1">{formErrors.participants}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Notes (optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Special requests..." rows={3} className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white resize-none placeholder:text-black/20" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-black text-white font-medium py-4 rounded-full hover:bg-black/80 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2">
                  {submitting ? 'Processing...' : <><span>Confirm Booking</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <div className="md:col-span-2">
                <div className="bg-white rounded-3xl overflow-hidden border border-black/[0.04] sticky top-28">
                  <div className="relative h-36 overflow-hidden">
                    <img src={selectedPackage.image} alt={selectedPackage.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${selectedPackage.tagColor}`}>{selectedPackage.tag}</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base" style={{ letterSpacing: '-0.02em' }}>{selectedPackage.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-black/50">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedPackage.duration}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedCountry}</span>
                    </div>
                    {selectedPackage.includes && selectedPackage.includes.length > 0 && (
                      <div className="pt-3 border-t border-black/5">
                        <p className="text-xs font-medium text-black/50 mb-2">Includes</p>
                        <ul className="space-y-1">
                          {selectedPackage.includes.map((item, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-black/60">
                              <Check className="w-3 h-3 text-black/40 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Voucher / Promo Code */}
                    <div className="pt-3 border-t border-black/5">
                      <p className="text-xs font-medium text-black/50 mb-2 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> Kode Promo
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={e => {
                            setVoucherCode(e.target.value.toUpperCase())
                            if (voucherResult) { setVoucherResult(null); setDiscountAmount(0) }
                          }}
                          placeholder="Masukkan kode"
                          className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20 font-mono uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleVoucherApply}
                          disabled={voucherLoading || !voucherCode.trim()}
                          className="px-3 py-2 bg-black text-white text-xs rounded-xl font-medium disabled:opacity-40 hover:bg-black/80 transition-colors shrink-0"
                        >
                          {voucherLoading ? '...' : 'Gunakan'}
                        </button>
                      </div>
                      {voucherResult && (
                        <p className={`text-xs mt-1.5 ${voucherResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                          {voucherResult.valid
                            ? `Diskon ${voucherResult.discount_type === 'percent' ? `${voucherResult.discount_value}%` : `Rp ${voucherResult.discount_amount?.toLocaleString('id-ID')}`} berhasil diterapkan!`
                            : voucherResult.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-black/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-black/40">${selectedPackage.price.toLocaleString()} × {form.participants} person{form.participants !== 1 ? 's' : ''}</span>
                        <span className="font-medium">${(selectedPackage.price * form.participants).toLocaleString()}</span>
                      </div>
                      {voucherResult?.valid && discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Diskon ({voucherResult.code})</span>
                          <span>-${discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-black/5">
                      <span>Total</span>
                      <span>${Math.max(0, selectedPackage.price * form.participants - discountAmount).toLocaleString()}</span>
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    }>
      <BookingPageInner />
    </Suspense>
  )
}

export default BookingPage
