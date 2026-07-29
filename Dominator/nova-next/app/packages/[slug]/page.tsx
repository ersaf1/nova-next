import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Check, X, Star, Clock, Users, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PackageDetailClient from '@/components/PackageDetailClient'
import type { TravelPackage, PackageDeparture } from '@/lib/types'
import { formatIDR } from '@/lib/types'

export default async function PackageSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Fetch package
  const { data: pkgRaw, error } = await supabase
    .from('Package')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'archived')
    .single()

  if (error || !pkgRaw) notFound()

  // Parse JSON arrays
  let includes: string[] = []
  let gallery: string[] = []
  let excluded: string[] = []
  try { includes = JSON.parse(pkgRaw.includes ?? '[]') } catch { includes = [] }
  try { gallery = JSON.parse(pkgRaw.gallery ?? '[]') } catch { gallery = [] }
  try { excluded = JSON.parse(pkgRaw.excluded ?? '[]') } catch { excluded = [] }

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
    : (pkg.duration ?? '')
  const displayRating = pkg.rating ?? 0
  const displayReviews = pkg.reviewCount ?? pkg.reviews ?? 0
  const displayPrice = pkg.price

  return (
    <div
      className="min-h-screen bg-[#F8F9FA] text-neutral-900 selection:bg-neutral-900 selection:text-white"
      style={{ letterSpacing: '-0.01em' }}
    >
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[460px] w-full overflow-hidden flex items-end">
        <Image
          src={coverImg}
          alt={displayTitle}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-[1]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-white hover:text-neutral-200 text-xs font-semibold uppercase tracking-wider mb-6 transition-colors duration-200 group bg-black/25 backdrop-blur-md px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            Semua Paket
          </Link>
          <div className="flex flex-wrap items-end gap-3">
            {pkg.tag && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${pkg.tagColor ?? 'bg-white text-black'}`}>
                {pkg.tag}
              </span>
            )}
            {pkg.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                {pkg.category}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-1" style={{ letterSpacing: '-0.02em' }}>
            {displayTitle}
          </h1>
          {displayLocation && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{displayLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
              {displayDuration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  {displayDuration}
                </span>
              )}
              {pkg.groupSize && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-neutral-400" />
                  {pkg.groupSize}
                </span>
              )}
              {displayRating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-neutral-800">{displayRating}</span>
                  {displayReviews > 0 && (
                    <span className="text-neutral-400">({displayReviews} ulasan)</span>
                  )}
                </span>
              )}
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-3">Galeri</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                  {gallery.slice(0, 6).map((img, i) => {
                    const gallerySrc = img.includes('?') ? img.replace(/w=\d+/, 'w=1600').replace(/q=\d+/, 'q=95') : `${img}?w=1600&q=95`
                    return (
                      <div key={i} className="relative h-40 overflow-hidden bg-neutral-900">
                        <Image
                          src={gallerySrc}
                          alt={`${displayTitle} ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {(pkg.description ?? pkg.shortDescription ?? pkg.highlight) && (
              <div>
                <h2 className="text-base font-semibold mb-3">Tentang Paket</h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {pkg.description ?? pkg.shortDescription ?? pkg.highlight}
                </p>
              </div>
            )}

            {/* Included */}
            {includes.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-3">Sudah Termasuk</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Excluded */}
            {excluded.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-3">Tidak Termasuk</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {excluded.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-500">
                      <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cancellation policy */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
              <h2 className="text-sm font-semibold mb-2">Kebijakan Pembatalan</h2>
              <ul className="space-y-1.5 text-xs text-neutral-500">
                <li>Pembatalan lebih dari 30 hari sebelum keberangkatan: pengembalian dana penuh.</li>
                <li>Pembatalan 15–30 hari sebelum keberangkatan: pengembalian dana 50%.</li>
                <li>Pembatalan kurang dari 15 hari: tidak ada pengembalian dana.</li>
              </ul>
            </div>

            {/* Important info */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
              <h2 className="text-sm font-semibold mb-2">Informasi Penting</h2>
              <ul className="space-y-1.5 text-xs text-neutral-500">
                <li>Pastikan paspor Anda masih berlaku minimal 6 bulan sebelum tanggal keberangkatan.</li>
                <li>Asuransi perjalanan sangat disarankan.</li>
                <li>Tiket pesawat belum termasuk kecuali disebutkan dalam paket.</li>
              </ul>
            </div>
          </div>

          {/* Right: sticky booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 space-y-5">

              {/* Price header */}
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">Harga mulai dari</p>
                <p className="text-3xl font-bold tracking-tight text-black">
                  {formatIDR(displayPrice)}
                </p>
                <p className="text-xs text-neutral-400">per orang</p>
                {pkg.originalPrice && pkg.originalPrice > displayPrice && (
                  <p className="text-xs text-neutral-300 line-through mt-0.5">
                    {formatIDR(pkg.originalPrice)}
                  </p>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] text-neutral-500 bg-neutral-50 border border-black/[0.04] px-2.5 py-1 rounded-full">
                  Konfirmasi instan
                </span>
                <span className="text-[10px] text-neutral-500 bg-neutral-50 border border-black/[0.04] px-2.5 py-1 rounded-full">
                  Pembayaran aman
                </span>
                <span className="text-[10px] text-neutral-500 bg-neutral-50 border border-black/[0.04] px-2.5 py-1 rounded-full">
                  Support 24/7
                </span>
              </div>

              {/* Departure selector + booking button */}
              <PackageDetailClient
                packageId={pkg.id}
                departures={departures}
                basePrice={displayPrice}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
