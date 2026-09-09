import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowLeft,
  Share2,
  Printer,
  Sparkles,
  Utensils,
  BedDouble,
  Coffee,
  CheckCircle2,
  CalendarCheck,
  MessageCircle,
  Clock
} from 'lucide-react'

interface Activity {
  time?: string
  activity?: string
  location?: string
  cost?: string
  tips?: string
  category?: string
  image?: string
}

interface Day {
  day: number
  title: string
  activities?: Activity[]
  meals?: { breakfast?: string; lunch?: string; dinner?: string }
  accommodation?: string
  estimatedDailyCost?: string
}

interface ItineraryContent {
  destination: string
  duration: number
  totalEstimatedCost?: string
  bestTimeToVisit?: string
  travelTips?: string[]
  days?: Day[]
}

async function getSharedItinerary(token: string) {
  if (token === 'demo' || token === 'sample') {
    return {
      title: 'Eksplorasi Budaya & Alam Bali Eksklusif',
      destination: 'Bali, Indonesia',
      duration: 3,
      travelers: 2,
      budget: 'Mid-range',
      preferences: '["cultural", "nature"]',
      visibility: 'public',
      shareToken: 'demo',
      generatedContent: JSON.stringify({
        destination: 'Bali, Indonesia',
        duration: 3,
        totalEstimatedCost: 'Rp 4.500.000',
        bestTimeToVisit: 'April - Oktober',
        travelTips: [
          'Gunakan pakaian sopan saat mengunjungi pura.',
          'Bawa tabir surya dan air mineral cukup.'
        ],
        days: [
          {
            day: 1,
            title: 'Ketibaan & Eksplorasi Ubud',
            meals: { breakfast: 'Resort Breakfast', lunch: 'Warung Babi Guling Ibu Oka', dinner: 'Bebek Bengil Ubud' },
            accommodation: 'Maya Ubud Resort & Spa',
            estimatedDailyCost: 'Rp 1.200.000',
            activities: [
              { time: '09:00', activity: 'Check-in resort mewah di Ubud & bersantai sejenak', location: 'Ubud' },
              { time: '13:00', activity: 'Menjelajahi Sacred Monkey Forest Sanctuary', location: 'Padangtegal' },
              { time: '16:30', activity: 'Menikmati panorama senja di Campuhan Ridge Walk', location: 'Campuhan' }
            ]
          },
          {
            day: 2,
            title: 'Pesona Dataran Tinggi Bedugul & Jimbaran',
            meals: { breakfast: 'Resort Breakfast', lunch: 'Restoran Mentari Bedugul', dinner: 'Jimbaran Seafood Candlelight' },
            accommodation: 'Maya Ubud Resort & Spa',
            estimatedDailyCost: 'Rp 1.800.000',
            activities: [
              { time: '08:30', activity: 'Perjalanan menuju Pura Ulun Danu Beratan', location: 'Danau Beratan' },
              { time: '13:30', activity: 'Singgah di Perkebunan Kopi Luwak & Kebun Raya Bali', location: 'Candikuning' },
              { time: '17:30', activity: 'Makan malam seafood segar tepi pantai saat matahari terbenam', location: 'Pantai Jimbaran' }
            ]
          },
          {
            day: 3,
            title: 'Pura Uluwatu & Belanja Oleh-oleh Khas',
            meals: { breakfast: 'Resort Breakfast', lunch: 'Warung Made Seminyak', dinner: 'Bandara DPS' },
            accommodation: 'Perjalanan Selesai',
            estimatedDailyCost: 'Rp 1.500.000',
            activities: [
              { time: '09:30', activity: 'Belanja kerajinan seni lokal di Pasar Seni Sukawati', location: 'Sukawati' },
              { time: '15:00', activity: 'Menyaksikan Tari Kecak sakral di tebing Pura Uluwatu', location: 'Pura Uluwatu' },
              { time: '18:30', activity: 'Pengantaran menuju Bandara Internasional Ngurah Rai', location: 'DPS Airport' }
            ]
          }
        ]
      })
    }
  }

  try {
    const { data, error } = await supabase
      .from('SavedItinerary')
      .select('*')
      .eq('shareToken', token)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export default async function SharedItineraryPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const record = await getSharedItinerary(token)

  if (!record) {
    notFound()
  }

  let content: ItineraryContent | null = null
  if (record.generatedContent) {
    try {
      content = typeof record.generatedContent === 'string'
        ? JSON.parse(record.generatedContent)
        : record.generatedContent
    } catch {
      content = null
    }
  }

  const destination = record.destination || content?.destination || 'Destinasi Wisata'
  const duration = record.duration || content?.duration || 3
  const travelers = record.travelers || 2
  const days: Day[] = content?.days || []

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-[#EAE5D9]">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/ai-planner"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-950 text-xs font-semibold group bg-white border border-stone-200/80 px-4 py-2 rounded-full shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Buat Rencana Sendiri di Smart Planner</span>
          </Link>

          <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#C29B38]/15 text-[#9E7B27] border border-[#C29B38]/30">
            Rencana Perjalanan Publik
          </span>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#C29B38]" />
              <span>Kurasi Rute Cerdas NOVA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif-luxury">
              {record.title || `Rencana Perjalanan ${destination}`}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-normal">
              Rundown perjalanan terverifikasi {duration} Hari untuk {travelers} orang wisatawan di {destination}.
            </p>
          </div>

          {/* Quick Meta Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-[#F5F2EB]/60 border border-stone-200/70 rounded-2xl">
              <span className="text-stone-400 font-medium block">Destinasi</span>
              <span className="font-bold text-stone-900 mt-0.5 block truncate">{destination}</span>
            </div>
            <div className="p-3.5 bg-[#F5F2EB]/60 border border-stone-200/70 rounded-2xl">
              <span className="text-stone-400 font-medium block">Durasi</span>
              <span className="font-bold text-stone-900 mt-0.5 block">{duration} Hari</span>
            </div>
            <div className="p-3.5 bg-[#F5F2EB]/60 border border-stone-200/70 rounded-2xl">
              <span className="text-stone-400 font-medium block">Wisatawan</span>
              <span className="font-bold text-stone-900 mt-0.5 block">{travelers} Orang</span>
            </div>
            <div className="p-3.5 bg-[#F5F2EB]/60 border border-stone-200/70 rounded-2xl">
              <span className="text-stone-400 font-medium block">Est. Biaya</span>
              <span className="font-bold text-emerald-800 mt-0.5 block">{content?.totalEstimatedCost || 'Fleksibel'}</span>
            </div>
          </div>

          {/* CTA Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100">
            <Link
              href={`/booking?destination=${encodeURIComponent(destination)}`}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#C29B38]" />
              <span>Pesan Rute Ini</span>
            </Link>

            <a
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Tim NOVA, saya melihat tautan rencana perjalanan bersama ke ${destination} (${duration} Hari). Saya ingin konsultasi ketersediaan paket dan reservasi.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Tanya Tim Concierge</span>
            </a>

            <Link
              href={`/ai-planner?destination=${encodeURIComponent(destination)}`}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer ml-auto"
            >
              <span>Salin & Modifikasi Rute</span>
            </Link>
          </div>
        </div>

        {/* Day-by-Day Itinerary Rundown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-3">
            <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C29B38]" />
              <span>Rangkaian Jadwal Harian</span>
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {days.length > 0 ? `${days.length} Hari Terencana` : `${duration} Hari`}
            </span>
          </div>

          {days.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <p className="text-sm font-bold text-stone-800">Rincian Kegiatan Sedang Disinkronkan</p>
              <p className="text-xs text-stone-500">
                Silakan klik tombol &quot;Salin &amp; Modifikasi Rute&quot; untuk melihat rincian aktivitas interaktif di Smart Planner.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {days.map((d) => (
                <div key={d.day} className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 space-y-5 shadow-2xs">
                  {/* Day Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#C29B38]/15 text-[#9E7B27]">
                        Hari ke-{d.day}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900">
                        {d.title}
                      </h3>
                    </div>
                    {d.estimatedDailyCost && (
                      <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200/60 shrink-0">
                        Est. {d.estimatedDailyCost}
                      </span>
                    )}
                  </div>

                  {/* Activities List */}
                  {d.activities && d.activities.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Agenda &amp; Spot Kunjungan
                      </p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {d.activities.map((act, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold text-[#C29B38] bg-white border border-stone-200 px-2 py-0.5 rounded-md shrink-0">
                                {act.time || `0${idx + 8}:00`}
                              </span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                                  {act.location || act.activity}
                                </h4>
                                {act.activity && act.activity !== act.location && (
                                  <p className="text-xs text-stone-500 font-normal mt-0.5">
                                    {act.activity}
                                  </p>
                                )}
                              </div>
                            </div>

                            {act.cost && (
                              <span className="text-[11px] font-medium text-stone-600 self-end sm:self-center">
                                {act.cost}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meals & Accommodation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-stone-100">
                    {d.meals && (
                      <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-[#C29B38]" /> Rekomendasi Kuliner
                        </span>
                        <p className="text-stone-700 font-medium">
                          {d.meals.lunch || d.meals.dinner || d.meals.breakfast || 'Kuliner khas autentik setempat'}
                        </p>
                      </div>
                    )}

                    {d.accommodation && (
                      <div className="p-3 bg-[#F5F2EB]/50 border border-stone-200/60 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-[#C29B38]" /> Akomodasi
                        </span>
                        <p className="text-stone-700 font-medium">
                          {d.accommodation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
