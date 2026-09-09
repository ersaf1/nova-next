import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Star, ArrowLeft, Calendar, ShieldCheck, Sparkles, Check, Landmark, Trees, UtensilsCrossed } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'
import { getAttractionsForDestination } from '@/lib/attractions'
import { CURATED_EXACT_LANDMARKS } from '@/lib/real-photos'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReviewSection from '@/components/ReviewSection'

type Destination = {
  id: number
  city: string
  country: string
  image: string
  description: string
  rating: number
  duration: string
  price: string
  category: string
}

async function getDestination(id: string): Promise<Destination | null> {
  const { data, error } = await supabase
    .from('Destination')
    .select('*')
    .eq('id', Number(id))
    .single()
  if (!error && data) return data as Destination

  try {
    const raw = await readFile(path.join(process.cwd(), 'data', 'destinations.json'), 'utf-8')
    const list: Destination[] = JSON.parse(raw)
    return list.find(d => d.id === Number(id)) ?? null
  } catch {
    return null
  }
}

function sightIcon(name: string) {
  const n = name.toLowerCase()
  if (/nature|park|green|garden/.test(n)) return Trees
  if (/food|cafe|culinar|restaurant/.test(n)) return UtensilsCrossed
  if (/landmark|scenic|architecture|museum|temple|historic|sight/.test(n)) return Landmark
  return MapPin
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = await getDestination(id)

  if (!destination) notFound()

  const dest = destination as Destination
  const attractions = getAttractionsForDestination(dest.city)

  const cityKey = dest.city?.toLowerCase()?.trim() || ''
  const heroImage =
    dest.image && dest.image.trim() !== ''
      ? dest.image
      : (cityKey && CURATED_EXACT_LANDMARKS[cityKey]) ||
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=90'

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[460px] w-full overflow-hidden flex items-end">
        <Image
          src={heroImage}
          alt={dest.city}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-[10000ms] ease-out hover:scale-105"
          priority
          unoptimized
        />
        {/* Modern clean light-overlay that ensures the picture remains 100% visible and only slightly darkens the text area */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent z-[1]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link href="/destinations" className="inline-flex items-center gap-2 text-white hover:text-stone-200 text-xs font-semibold uppercase tracking-wider mb-6 transition-colors duration-200 group bg-stone-950/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Semua Destinasi
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#C29B38] text-white">
              <MapPin className="w-3 h-3" />
              {dest.country}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-stone-900/80 border border-white/10 text-white backdrop-blur-sm">
              {dest.category}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-normal font-serif-luxury tracking-tight text-white mb-4">
            {dest.city}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            <div className="flex items-center gap-1.5 bg-stone-950/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white font-bold">{dest.rating}</span>
              <span className="text-white/60 text-xs font-normal ml-0.5">(Ulasan Istimewa)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-950/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Clock className="w-4 h-4 text-[#C29B38]" />
              <span>Saran Durasi: {dest.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column - 2 Cols */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Overview Card */}
            <section className="bg-white border border-stone-200/80 p-8 rounded-3xl shadow-2xs">
              <h2 className="text-xl font-normal font-serif-luxury mb-4 text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C29B38]" /> <span>Overview</span>
              </h2>
              <p className="text-stone-600 leading-relaxed text-[15px] font-normal">
                {dest.description}
              </p>
            </section>

            {/* Attractions grid */}
            {attractions.length > 0 && (
              <section className="space-y-6">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C29B38] mb-1">
                    Curated Landmarks
                  </div>
                  <h2 className="text-2xl font-normal font-serif-luxury text-stone-900">Top Sights in {dest.city}</h2>
                  <p className="text-xs text-stone-500 mt-1">Add these high-rated sights to your luxury itinerary</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {attractions.map((a, i) => (
                    <div key={i} className="group bg-white border border-stone-200/80 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300">
                      {a.image && !a.image.includes('/api/geo/map-image') ? (
                        <div className="relative h-48 overflow-hidden bg-stone-900">
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-full h-full object-cover img-smooth-zoom"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                          <span className="absolute bottom-4 left-4 text-sm font-semibold text-white">{a.name}</span>
                        </div>
                      ) : (
                        <div className="relative h-48 overflow-hidden bg-stone-900 flex items-center justify-center">
                          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border-[12px] border-white/5" />
                          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-white/5" />
                          {(() => { const Icon = sightIcon(a.name); return <Icon className="w-12 h-12 text-[#C29B38]/80" strokeWidth={1.25} /> })()}
                          <span className="absolute bottom-4 left-4 text-sm font-semibold text-white">{a.name}</span>
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-xs text-stone-600 leading-relaxed font-normal">{a.description || 'Famous landmark offering scenic views and beautiful photography spots.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <div className="bg-white border border-stone-200/80 p-8 rounded-3xl shadow-2xs">
              <ReviewSection entityType="destination" entityId={dest.id} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xl shadow-stone-200/40 space-y-6">
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Starting From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">{dest.price}</span>
                  <span className="text-xs text-stone-400">/ traveler</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-stone-100 text-xs text-stone-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center border border-stone-200/80 text-[#C29B38]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Durasi Perjalanan: {dest.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center border border-stone-200/80 text-[#C29B38]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Lokasi: {dest.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center border border-stone-200/80 text-[#C29B38]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Jadwal keberangkatan fleksibel harian</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center border border-stone-200/80 text-[#C29B38]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Konfirmasi instan & transaksi aman resmi</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href={`/booking?destination=${encodeURIComponent(dest.city)}`}
                  className="block w-full text-center bg-stone-900 hover:bg-black text-[#FAF9F6] font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-stone-900/10 text-xs cursor-pointer"
                >
                  Pesan Liburan ke Destinasi Ini
                </Link>
                
                <Link
                  href="/destinations"
                  className="block w-full text-center bg-[#F5F2EB] hover:bg-stone-200/60 text-stone-800 font-semibold py-3 rounded-2xl border border-stone-200/80 transition-all text-xs cursor-pointer"
                >
                  Jelajahi Destinasi Lainnya
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
