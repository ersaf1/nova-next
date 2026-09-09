'use client'

import React, { useState } from 'react'
import {
  Clock,
  MapPin,
  Utensils,
  Hotel,
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera,
  Coffee,
  CheckCircle2,
  CalendarDays
} from 'lucide-react'
import type { ItineraryDay } from '@/lib/types'

interface ItineraryTimelineProps {
  daysCount?: number
  destinationTitle?: string
  existingItinerary?: ItineraryDay[]
}

// Cerdas membuat fallback itinerary realistis jika paket belum memiliki itinerary terinci
function generateFallbackItinerary(days: number, destination: string): ItineraryDay[] {
  const result: ItineraryDay[] = []

  for (let i = 1; i <= days; i++) {
    if (i === 1) {
      result.push({
        day: 1,
        title: 'Kedatangan & Sambutan Hangat VIP',
        subtitle: 'Bandara Internasional - Check-in Resort Bintang 5',
        description: `Tiba di bandara tujuan, disambut langsung oleh tim Travel Concierge NOVA dengan garland bunga dan private MPV ber-AC. Mengantarkan Anda menuju resort untuk proses check-in express tanpa antre, dilanjutkan makan malam santai menyambut petualangan.`,
        activities: [
          'Penjemputan bandara privat VIP dengan papan nama resmi',
          'Perjalanan santai menuju akomodasi resort bintang 5 pilihan',
          'Welcome drink segar & express check-in kamar',
          'Gala Dinner selamat datang dengan menu autentik lokal'
        ],
        meals: { breakfast: false, lunch: false, dinner: true },
        hotel: 'Luxury Resort & Spa Terkurasi (Bintang 5)',
        highlights: ['Private Airport Transfer', 'Welcome Dinner']
      })
    } else if (i === days) {
      result.push({
        day: i,
        title: 'Pelepasan, Belanja Suvenir & Penerbangan Pulang',
        subtitle: 'Check-out Resort - Bandara Keberangkatan',
        description: `Nikmati sarapan mewah terakhir di resort, waktu santai berenang atau bersiap-siap. Singgah di butik kerajinan tangan lokal pilihan kurasi NOVA untuk berbelanja oleh-oleh sebelum diantar tepat waktu menuju bandara internasional.`,
        activities: [
          'Sarapan buffet internasional di restoran tepi pantai/taman',
          'Waktu bebas untuk relaksasi atau foto kenang-kenangan terakhir',
          'Kunjungan belanja sentra cinderamata & oleh-oleh khas premium',
          'Pengantaran privat kembali ke bandara untuk penerbangan pulang'
        ],
        meals: { breakfast: true, lunch: true, dinner: false },
        hotel: 'Penerbangan Pulang',
        highlights: ['Souvenir Shopping', 'Airport Departure Transfer']
      })
    } else {
      const dayThemes = [
        {
          title: `Eksplorasi Mahakarya Budaya & Ikon Sejarah ${destination}`,
          sub: 'Cagar Warisan UNESCO - Pusat Tradisi Lokal',
          desc: `Memulai hari setelah sarapan dengan mengunjungi situs warisan sejarah paling tersohor dipandu oleh Certified Local Historian. Menikmati makan siang di restoran tradisional legendaris.`,
          act: [
            'Kunjungan berpemandu ke kompleks cagar budaya utama',
            'Sesi foto privat di spot pemandangan paling ikonik',
            'Makan siang kuliner khas daerah di restoran tepi danau/lembah',
            'Interaksi santai mengenal tradisi pengrajin seni setempat'
          ],
          meals: { breakfast: true, lunch: true, dinner: true },
          hotel: 'Luxury Resort & Spa Terkurasi (Bintang 5)',
          highlights: ['Cultural Immersion', 'Local Historian Guide']
        },
        {
          title: `Petualangan Alam Terbuka & Eksplorasi Panorama Indah`,
          sub: 'Panorama Alam Spektakuler - Waktu Santai',
          desc: `Jelajahi keindahan panorama bentang alam spektakuler. Dilanjutkan pelayaran perahu/jalan santai menikmati udara segar dan keheningan alam nan memukau.`,
          act: [
            'Perjalanan menuju titik pandang alam tertinggi dan tercantik',
            'Eksplorasi bentang alam alamiah dengan jalur trekking ringan',
            'Piknik privat santai di alam terbuka dengan sajian gourmet',
            'Kembali ke resort untuk menikmati fasilitas spa dan relaksasi sore'
          ],
          meals: { breakfast: true, lunch: true, dinner: true },
          hotel: 'Luxury Resort & Spa Terkurasi (Bintang 5)',
          highlights: ['Scenic Nature Trail', 'Gourmet Picnic']
        },
        {
          title: `Petualangan Bahari / Eksplorasi Tersembunyi & Sunset Cruise`,
          sub: 'Destinasi Rahasia - Makan Malam Golden Hour',
          desc: `Mengunjungi sudut tersembunyi yang jarang dijamah wisatawan umum. Nikmati matahari terbenam spektakuler seraya menikmati sajian seafood segar langsung di tepi pantai.`,
          act: [
            'Menuju dermaga privat untuk pengalaman cruise/eksplorasi kepulauan',
            'Snorkeling / jelajah perairan tenang dengan pemandu bersertifikat',
            'Menikmati minuman segar menyambut golden hour matahari terbenam',
            'Makan malam romantis dengan pemandangan cakrawala senja'
          ],
          meals: { breakfast: true, lunch: true, dinner: true },
          hotel: 'Luxury Resort & Spa Terkurasi (Bintang 5)',
          highlights: ['Sunset Experience', 'Private Boat Expedition']
        }
      ]

      const theme = dayThemes[(i - 2) % dayThemes.length]
      result.push({
        day: i,
        title: theme.title,
        subtitle: theme.sub,
        description: theme.desc,
        activities: theme.act,
        meals: theme.meals,
        hotel: theme.hotel,
        highlights: theme.highlights
      })
    }
  }

  return result
}

export default function ItineraryTimeline({
  daysCount = 4,
  destinationTitle = 'Destinasi Wisata',
  existingItinerary
}: ItineraryTimelineProps) {
  const finalDays = Math.max(1, daysCount || 4)
  const itinerary = existingItinerary && existingItinerary.length > 0
    ? existingItinerary
    : generateFallbackItinerary(finalDays, destinationTitle)

  // Default buka Hari 1 & Hari 2
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({ 1: true, 2: true })

  const toggleDay = (dayNum: number) => {
    setOpenDays(prev => ({ ...prev, [dayNum]: !prev[dayNum] }))
  }

  const expandAll = () => {
    const all: Record<number, boolean> = {}
    itinerary.forEach(item => { all[item.day] = true })
    setOpenDays(all)
  }

  const collapseAll = () => {
    setOpenDays({})
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
      
      {/* Header Itinerary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <CalendarDays className="w-5 h-5 text-[#C29B38]" />
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-normal text-stone-900">
              Rencana Perjalanan Hari demi Hari
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Rundown terkurasi durasi {finalDays} Hari {Math.max(1, finalDays - 1)} Malam. Waktu dan urutan dapat disesuaikan dengan permintaan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Buka Semua
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Tutup Semua
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-4 sm:pl-6 space-y-6 before:absolute before:left-[19px] sm:before:left-[27px] before:top-3 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#C29B38] before:via-stone-200 before:to-stone-200">
        {itinerary.map((item) => {
          const isOpen = Boolean(openDays[item.day])

          return (
            <div key={item.day} className="relative group">
              
              {/* Day Node Circle Indicator */}
              <div
                onClick={() => toggleDay(item.day)}
                className={`absolute -left-6 sm:-left-8 top-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs transition-all duration-200 cursor-pointer shadow-xs ${
                  isOpen
                    ? 'bg-[#C29B38] text-white ring-4 ring-[#FAF9F6]'
                    : 'bg-stone-100 text-stone-600 border border-stone-300 group-hover:bg-[#C29B38] group-hover:text-white'
                }`}
              >
                H{item.day}
              </div>

              {/* Day Card */}
              <div className="ml-5 sm:ml-6 rounded-2xl border border-stone-200/90 bg-[#FAF9F6] transition-all duration-200 overflow-hidden">
                
                {/* Header Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(item.day)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#F5F2EB]/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#C29B38]/15 text-[#9E7B27]">
                        Hari ke-{item.day}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                          &bull; {item.subtitle}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#9E7B27] transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="shrink-0 p-1.5 rounded-full bg-white border border-stone-200/80 text-stone-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-stone-200/60 bg-white space-y-4 text-xs">
                    
                    {/* Narrative Description */}
                    <p className="text-stone-600 leading-relaxed font-normal pt-3">
                      {item.description}
                    </p>

                    {/* Activity Rundown Items */}
                    {item.activities && item.activities.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Rangkaian Kegiatan & Agenda
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {item.activities.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/60"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="text-stone-800 font-medium leading-relaxed">
                                {act}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta Bar: Meals & Hotel */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
                      
                      {/* Meals Status */}
                      <div className="flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-[#C29B38]" />
                        <span className="font-semibold text-stone-800">Konsumsi:</span>
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className={`px-2 py-0.5 rounded ${item.meals?.breakfast ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-stone-100 text-stone-400 line-through'}`}>
                            Pagi
                          </span>
                          <span className={`px-2 py-0.5 rounded ${item.meals?.lunch ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-stone-100 text-stone-400 line-through'}`}>
                            Siang
                          </span>
                          <span className={`px-2 py-0.5 rounded ${item.meals?.dinner ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-stone-100 text-stone-400 line-through'}`}>
                            Malam
                          </span>
                        </div>
                      </div>

                      {/* Hotel / Lodging */}
                      {item.hotel && (
                        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                          <Hotel className="w-3.5 h-3.5 text-[#C29B38]" />
                          <span>{item.hotel}</span>
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
