import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, MapPin, Clock, Users, Star, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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

const STEPS = ['Negara', 'Paket', 'Detail']

const BookingPage: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<BookingForm>({
    name: '', email: '', phone: '', travelDate: '', participants: 1, notes: '',
  })

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then((data: Package[]) => { setPackages(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Extract unique categories as "countries"
  const countries = Array.from(new Set(packages.map(p => p.category))).filter(Boolean)
  const filteredCountries = countries.filter(c => c.toLowerCase().includes(search.toLowerCase()))
  const filteredPackages = packages.filter(p => p.category === selectedCountry)

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country)
    setStep(1)
  }

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    setStep(2)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.name === 'participants' ? parseInt(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          packageName: selectedPackage.title,
          country: selectedCountry,
          ...form,
        }),
      })
      if (res.ok) setSubmitted(true)
    } catch {
      // handle error silently, user can retry
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
            <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
              Booking Berhasil!
            </h2>
            <p className="text-black/50 text-sm mb-2">
              Terima kasih, <span className="text-black font-medium">{form.name}</span>.
            </p>
            <p className="text-black/50 text-sm mb-8">
              Konfirmasi akan dikirim ke <span className="text-black font-medium">{form.email}</span>. Tim kami akan menghubungi kamu segera.
            </p>
            <div className="bg-[#F5F5F5] rounded-2xl p-5 text-left mb-8 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Paket</span>
                <span className="font-medium">{selectedPackage?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Destinasi</span>
                <span className="font-medium">{selectedCountry}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Tanggal</span>
                <span className="font-medium">{form.travelDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/50">Peserta</span>
                <span className="font-medium">{form.participants} orang</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-black/5">
                <span className="text-black/50">Total</span>
                <span className="font-bold">
                  ${selectedPackage ? (selectedPackage.price * form.participants).toLocaleString() : 0}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-black text-white font-medium py-3 rounded-full hover:bg-black/80 transition-colors text-sm"
            >
              Kembali ke Beranda
            </button>
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

          {/* Header */}
          <div className="mb-10">
            <button
              onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
              className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? 'Kembali ke Beranda' : 'Kembali'}
            </button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ letterSpacing: '-0.03em' }}>
              Booking Perjalanan
            </h1>
            <p className="text-black/50 text-sm">Pilih destinasi impianmu dan mulai petualangan.</p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-black text-white' :
                    i === step ? 'bg-black text-white ring-4 ring-black/10' :
                    'bg-black/10 text-black/30'
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-black' : 'text-black/30'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? 'bg-black' : 'bg-black/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Pilih Negara/Kategori */}
          {step === 0 && (
            <div>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input
                    type="text"
                    placeholder="Cari destinasi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-black/[0.06] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-black/30"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
                  ))}
                </div>
              ) : filteredCountries.length === 0 ? (
                <div className="text-center py-16 text-black/30 text-sm">Tidak ada destinasi ditemukan.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredCountries.map(country => {
                    const count = packages.filter(p => p.category === country).length
                    const thumb = packages.find(p => p.category === country)?.image
                    return (
                      <button
                        key={country}
                        onClick={() => handleSelectCountry(country)}
                        className="group relative bg-white rounded-2xl overflow-hidden border border-black/[0.04] hover:shadow-lg transition-all duration-300 text-left h-36"
                      >
                        {thumb && (
                          <img
                            src={thumb}
                            alt={country}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                          />
                        )}
                        <div className="relative p-5 h-full flex flex-col justify-between">
                          <MapPin className="w-5 h-5 text-black/40" />
                          <div>
                            <p className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.02em' }}>{country}</p>
                            <p className="text-xs text-black/40 mt-0.5">{count} paket tersedia</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Pilih Paket */}
          {step === 1 && (
            <div>
              <p className="text-sm text-black/40 mb-6">
                Menampilkan paket untuk <span className="text-black font-medium">{selectedCountry}</span>
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                {filteredPackages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg)}
                    className="group bg-white rounded-3xl overflow-hidden border border-black/[0.04] hover:shadow-xl transition-all duration-300 text-left flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor}`}>
                        {pkg.tag}
                      </span>
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
                        <div>
                          <span className="font-bold text-lg">${pkg.price.toLocaleString()}</span>
                          <span className="text-xs text-black/30 ml-1">/orang</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-black bg-black/5 px-3 py-1.5 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                          Pilih <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Form Detail */}
          {step === 2 && selectedPackage && (
            <div className="grid md:grid-cols-5 gap-8">
              {/* Form */}
              <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Nama Lengkap *</label>
                    <input
                      name="name" value={form.name} onChange={handleFormChange} required
                      placeholder="Nama kamu"
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Email *</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleFormChange} required
                      placeholder="email@kamu.com"
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">No. HP *</label>
                    <input
                      name="phone" type="tel" value={form.phone} onChange={handleFormChange} required
                      placeholder="+62 ..."
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white placeholder:text-black/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Tanggal Keberangkatan *</label>
                    <input
                      name="travelDate" type="date" value={form.travelDate} onChange={handleFormChange} required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Jumlah Peserta *</label>
                    <input
                      name="participants" type="number" value={form.participants} onChange={handleFormChange} required
                      min={1} max={20}
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-black/50 mb-1.5">Catatan (opsional)</label>
                    <textarea
                      name="notes" value={form.notes} onChange={handleFormChange}
                      placeholder="Permintaan khusus, alergi makanan, dll."
                      rows={3}
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white resize-none placeholder:text-black/20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white font-medium py-4 rounded-full hover:bg-black/80 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? 'Memproses...' : (
                    <>Konfirmasi Booking <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Summary */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-3xl overflow-hidden border border-black/[0.04] sticky top-28">
                  <div className="relative h-36 overflow-hidden">
                    <img src={selectedPackage.image} alt={selectedPackage.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${selectedPackage.tagColor}`}>
                      {selectedPackage.tag}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base" style={{ letterSpacing: '-0.02em' }}>{selectedPackage.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-black/50">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedPackage.duration}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedCountry}</span>
                    </div>
                    <div className="pt-3 border-t border-black/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-black/40">${selectedPackage.price.toLocaleString()} × {form.participants} orang</span>
                        <span className="font-medium">${(selectedPackage.price * form.participants).toLocaleString()}</span>
                      </div>
                      {selectedPackage.originalPrice > selectedPackage.price && (
                        <div className="flex justify-between text-xs text-green-600">
                          <span>Hemat</span>
                          <span>${((selectedPackage.originalPrice - selectedPackage.price) * form.participants).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-black/5">
                      <span>Total</span>
                      <span>${(selectedPackage.price * form.participants).toLocaleString()}</span>
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

export default BookingPage
