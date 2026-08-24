import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Star, ArrowLeft, Calendar, ShieldCheck, Sparkles, Check, Landmark, Trees, UtensilsCrossed } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'
import { getAttractionsForDestination } from '@/lib/attractions'
import Navbar from '@/components/Navbar'
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 selection:bg-neutral-900 selection:text-white" style={{ letterSpacing: '-0.01em' }}>
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[460px] w-full overflow-hidden flex items-end">
        <Image
          src={dest.image || ''}
          alt={dest.city}
          fill
          className="object-cover transition-transform duration-[10000ms] ease-out hover:scale-105"
          priority
        />
        {/* Modern clean light-overlay that ensures the picture remains 100% visible and only slightly darkens the text area */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-[1]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link href="/destinations" className="inline-flex items-center gap-2 text-white hover:text-neutral-200 text-xs font-semibold uppercase tracking-wider mb-6 transition-colors duration-200 group bg-black/25 backdrop-blur-md px-4 py-2 rounded-full">
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" /> 
            Back to Destinations
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-brand text-white">
              <MapPin className="w-3 h-3" />
              {dest.country}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 border border-black/[0.06] text-neutral-700 backdrop-blur-sm">
              {dest.category}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            {dest.city}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-1.5 bg-black/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white font-bold">{dest.rating}</span>
              <span className="text-white/50 text-xs font-normal ml-0.5">(Excellent review)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
              <Clock className="w-4 h-4 text-white/50" />
              <span>Recommend: {dest.duration}</span>
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
            <section className="bg-white border border-black/[0.05] p-8 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-neutral-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neutral-400" /> Overview
              </h2>
              <p className="text-neutral-600 leading-relaxed text-[15px] font-normal">
                {dest.description}
              </p>
            </section>

            {/* Attractions grid */}
            {attractions.length > 0 && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-950">Top Sights in {dest.city}</h2>
                  <p className="text-xs text-neutral-400 mt-1">Add these high-rated sights to your bucket list</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {attractions.map((a, i) => (
                    <div key={i} className="group bg-white border border-black/[0.05] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                      {a.image && !a.image.includes('/api/geo/map-image') ? (
                        <div className="relative h-48 overflow-hidden bg-neutral-100">
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-full h-full object-cover img-smooth-zoom"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-4 left-4 text-sm font-semibold text-white">{a.name}</span>
                        </div>
                      ) : (
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark flex items-center justify-center">
                          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border-[12px] border-white/10" />
                          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-white/10" />
                          <div className="absolute top-5 right-6 w-2 h-2 rounded-full bg-white/40" />
                          <div className="absolute top-9 right-16 w-1.5 h-1.5 rounded-full bg-white/30" />
                          {(() => { const Icon = sightIcon(a.name); return <Icon className="w-14 h-14 text-white/90" strokeWidth={1.25} /> })()}
                          <span className="absolute bottom-4 left-4 text-sm font-semibold text-white">{a.name}</span>
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-xs text-neutral-500 leading-relaxed font-light">{a.description || 'Famous landmark offering scenic views and beautiful photography spots.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <div className="bg-white border border-black/[0.05] p-8 rounded-2xl shadow-sm">
              <ReviewSection entityType="destination" entityId={dest.id} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm space-y-6">
              
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Starting From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-neutral-900 tracking-tight">{dest.price}</span>
                  <span className="text-xs text-neutral-400">/ traveler</span>
                </div>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-black/[0.06] text-sm text-neutral-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-black/[0.04]">
                    <Clock className="w-4 h-4 text-neutral-800" />
                  </div>
                  <span>{dest.duration} Travel Duration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-black/[0.04]">
                    <MapPin className="w-4 h-4 text-neutral-800" />
                  </div>
                  <span>{dest.country} Location</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-black/[0.04]">
                    <Calendar className="w-4 h-4 text-neutral-800" />
                  </div>
                  <span>Daily departures available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-black/[0.04]">
                    <ShieldCheck className="w-4 h-4 text-neutral-800" />
                  </div>
                  <span>Instant confirmation & Secure payment</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href={`/booking?destination=${encodeURIComponent(dest.city)}`}
                  className="block w-full text-center bg-brand hover:bg-brand-dark active:bg-brand-darker text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm"
                >
                  Book This Destination
                </Link>
                
                <Link
                  href="/destinations"
                  className="block w-full text-center bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-medium py-3 rounded-xl border border-black/[0.04] transition-all duration-200 text-sm"
                >
                  View All Destinations
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
