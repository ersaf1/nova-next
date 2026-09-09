import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  X,
  Star,
  Clock,
  Users,
  MapPin,
  ShieldCheck,
  Zap,
  Calendar,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PackageDetailClient from '@/components/PackageDetailClient'
import ItineraryTimeline from '@/components/ItineraryTimeline'
import type { TravelPackage, PackageDeparture } from '@/lib/types'
import { formatIDR } from '@/lib/types'

async function getPackageBySlug(slug: string) {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('Package')
      .select('*')
      .eq('slug', slug)
      .neq('status', 'archived')
      .single()
    if (!error && data) return data
  } catch {}

  // Fallback to local JSON
  try {
    const raw = await readFile(path.join(process.cwd(), 'data', 'packages.json'), 'utf-8')
    const packages = JSON.parse(raw)
    const found = packages.find((p: { slug?: string }) => p.slug === slug)
    if (found) return { ...found, status: 'published' }
  } catch {}

  return null
}

export default async function PackageSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const pkgRaw = await getPackageBySlug(slug)
  if (!pkgRaw) notFound()

  // Parse JSON arrays
  let includes: string[] = []
  let gallery: string[] = []
  let excluded: string[] = []
  try { includes = Array.isArray(pkgRaw.includes) ? pkgRaw.includes : JSON.parse(pkgRaw.includes ?? '[]') } catch { includes = [] }
  try { gallery = Array.isArray(pkgRaw.gallery) ? pkgRaw.gallery : JSON.parse(pkgRaw.gallery ?? '[]') } catch { gallery = [] }
  try { excluded = Array.isArray(pkgRaw.excluded) ? pkgRaw.excluded : JSON.parse(pkgRaw.excluded ?? '[]') } catch { excluded = [] }

  const pkg: TravelPackage = { ...pkgRaw, includes, gallery, excluded }

  // Fetch upcoming departures
  const today = new Date().toISOString().split('T')[0]
  const { data: departuresRaw } = await supabase
    .from('PackageDeparture')
    .select('*')
    .eq('packageId', pkg.id)
    .gte('startDate', today)
    .neq('status', 'cancelled')
    .order('startDate', { ascending: true })

  const departures: PackageDeparture[] = (departuresRaw ?? []) as PackageDeparture[]

  const rawCover = pkg.coverImage || pkg.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=95'
  const coverImg = rawCover.includes('?') 
    ? rawCover.replace(/w=\d+/, 'w=2000').replace(/q=\d+/, 'q=95') 
    : `${rawCover}?w=2000&q=95`

  const displayTitle = pkg.title
  const displayLocation = pkg.subtitle ?? pkg.category ?? ''
  const displayDuration = pkg.durationDays
    ? `${pkg.durationDays} Hari / ${pkg.durationNights ?? pkg.durationDays - 1} Malam`
    : (pkg.duration ?? '4 Hari 3 Malam')
  const displayRating = pkg.rating ?? 4.9
  const displayReviews = pkg.reviewCount ?? pkg.reviews ?? 184
  const displayPrice = pkg.price

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />

      {/* Hero Gallery Banner */}
      <div className="pt-24 pb-8 px-4 sm:px-6 md:px-8 max-w-[88rem] mx-auto space-y-4">
        
        {/* Back Link & Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-950 text-xs font-semibold transition-colors group bg-white border border-stone-200/80 px-4 py-2 rounded-full shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Semua Paket</span>
          </Link>

          <div className="flex items-center gap-2">
            {pkg.tag && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-stone-900 text-[#F5F2EB]">
                {pkg.tag}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C29B38]/15 text-[#9E7B27] border border-[#C29B38]/30">
              {pkg.category || 'All-Inclusive'}
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C29B38]">
            Curated Expedition &middot; Private Itinerary
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            {displayTitle}
          </h1>
          {displayLocation && (
            <p className="flex items-center gap-1.5 text-stone-500 text-xs sm:text-sm font-medium">
              <MapPin className="w-4 h-4 text-[#C29B38]" />
              <span>{displayLocation}</span>
            </p>
          )}
        </div>

        {/* Hero Photo Bento Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-md">
          {/* Main Large Photo (2 or 3 cols) */}
          <div className="relative md:col-span-2 h-full bg-neutral-900 overflow-hidden group">
            <Image
              src={coverImg}
              alt={displayTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
              unoptimized
            />
          </div>

          {/* Sub Gallery Photos */}
          <div className="hidden md:grid grid-cols-1 gap-3 md:col-span-1 h-full">
            <div className="relative h-full bg-neutral-900 overflow-hidden group">
              <Image
                src={gallery[0] || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=85'}
                alt={`${displayTitle} 1`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </div>
            <div className="relative h-full bg-neutral-900 overflow-hidden group">
              <Image
                src={gallery[1] || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1000&q=85'}
                alt={`${displayTitle} 2`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </div>
          </div>

          <div className="hidden md:grid grid-cols-1 gap-3 md:col-span-1 h-full">
            <div className="relative h-full bg-neutral-900 overflow-hidden group">
              <Image
                src={gallery[2] || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=85'}
                alt={`${displayTitle} 3`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </div>
            <div className="relative h-full bg-neutral-900 overflow-hidden group">
              <Image
                src={gallery[3] || coverImg}
                alt={`${displayTitle} 4`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center text-white font-extrabold text-xs">
                <span>Lihat Semua Foto</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content & Sticky Booking Sidebar */}
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Package Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Meta Stats Row */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs text-xs font-medium text-stone-700">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C29B38]" />
                <span>{displayDuration}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#C29B38]" />
                <span>{pkg.groupSize || '2-10 Orang'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-stone-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{displayRating} ({displayReviews} ulasan traveler)</span>
              </span>
            </div>

            {/* Description / Overview */}
            {(pkg.description ?? pkg.shortDescription ?? pkg.highlight) && (
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-3 shadow-2xs">
                <h2 className="text-xl font-normal font-serif-luxury text-stone-900 tracking-tight">
                  Ringkasan Perjalanan
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  {pkg.description ?? pkg.shortDescription ?? pkg.highlight}
                </p>
              </div>
            )}

            {/* Day-by-Day Itinerary Rundown */}
            <ItineraryTimeline
              daysCount={pkg.durationDays || (pkg.duration ? parseInt(pkg.duration) : 5)}
              destinationTitle={displayTitle}
              existingItinerary={pkg.itinerary}
            />

            {/* Inclusions & Exclusions Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Inclusions */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-serif-luxury text-base font-normal">Fasilitas Termasuk</h3>
                </div>
                <ul className="space-y-2.5">
                  {(includes.length > 0 ? includes : [
                    'Tiket Pesawat Pulang Pergi (PP)',
                    'Resort/Hotel Bintang 5 Terkurasi',
                    'Transportasi Wisata Privat AC',
                    'Makan Pagi, Siang & Malam',
                    'Tour Guide Berlisensi Resmi',
                    'Asuransi Perjalanan Wisata'
                  ]).map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-700 font-medium leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <X className="w-4 h-4 text-rose-500" />
                  <h3 className="font-serif-luxury text-base font-normal text-stone-800">Tidak Termasuk</h3>
                </div>
                <ul className="space-y-2.5">
                  {(excluded.length > 0 ? excluded : [
                    'Pengeluaran Pribadi & Laundry',
                    'Tipping Guide & Driver (Sukarela)',
                    'Biaya Pembuatan Paspor / Visa Pribadi'
                  ]).map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-500 font-medium leading-relaxed">
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
                <h3 className="font-serif-luxury text-base font-normal">Kebijakan Pembatalan & Garansi Refund</h3>
              </div>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed font-normal">
                <li>• <strong>Pembatalan &gt; 30 hari</strong> sebelum jadwal keberangkatan: <strong>100% Pengembalian Dana (Refund Penuh)</strong>.</li>
                <li>• <strong>Pembatalan 15–30 hari</strong> sebelum jadwal: <strong>50% Pengembalian Dana</strong>.</li>
                <li>• <strong>Reschedule Fleksibel:</strong> Bebas ubah tanggal 1x hingga 14 hari sebelum keberangkatan.</li>
              </ul>
            </div>

            {/* Important Info */}
            <div className="bg-[#F5F2EB]/90 rounded-3xl border border-stone-300/70 p-6 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-[#C29B38]" />
                <h3 className="font-serif-luxury text-base font-normal">Catatan Penting Traveler</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 leading-relaxed">
                <li>• Untuk destinasi luar negeri, pastikan paspor masih berlaku minimal 6 bulan.</li>
                <li>• Konfirmasi e-ticket dan voucher hotel akan langsung terbit ke akun & email setelah pembayaran berhasil.</li>
              </ul>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/40 p-6 sm:p-7 space-y-6">
              
              {/* Price Header */}
              <div className="pb-4 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Harga Mulai Dari
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-stone-900 tracking-tight">
                    {formatIDR(displayPrice)}
                  </span>
                  <span className="text-xs text-stone-400 font-normal">/ orang</span>
                </div>
                {pkg.originalPrice && pkg.originalPrice > displayPrice && (
                  <p className="text-xs text-stone-400 line-through font-medium mt-0.5">
                    {formatIDR(pkg.originalPrice)}
                  </p>
                )}
              </div>

              {/* Trust Badges Pill Bar */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Konfirmasi Instan
                </span>
                <span className="text-[10px] font-bold text-[#9E7B27] bg-[#C29B38]/10 border border-[#C29B38]/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Garansi Refund
                </span>
                <span className="text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-200/70 px-2.5 py-1 rounded-full">
                  Support 24/7
                </span>
              </div>

              {/* Client-side Departure Selector & Direct Booking Form */}
              <PackageDetailClient
                packageId={Number(pkg.id)}
                departures={departures}
                basePrice={displayPrice}
                packageTitle={displayTitle}
              />

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
