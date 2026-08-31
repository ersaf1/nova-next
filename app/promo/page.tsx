import { Tag, ShoppingBag, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PromoCard from '@/components/PromoCard'

export const revalidate = 60

export default async function PromoPage() {
  const now = new Date().toISOString()
  const { data: coupons } = await supabase
    .from('Coupon')
    .select('*')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })

  const fallbackCoupons = [
    {
      id: 1,
      code: 'NOVAHOLIDAY',
      discount_type: 'percent' as const,
      discount_value: 15,
      min_amount: 5000000,
      max_uses: 500,
      used_count: 84,
      expires_at: null,
      is_active: true
    },
    {
      id: 2,
      code: 'PHINISIPROMO',
      discount_type: 'fixed' as const,
      discount_value: 1000000,
      min_amount: 8000000,
      max_uses: 200,
      used_count: 42,
      expires_at: null,
      is_active: true
    },
    {
      id: 3,
      code: 'FIRSTTRIP',
      discount_type: 'fixed' as const,
      discount_value: 500000,
      min_amount: 3000000,
      max_uses: 1000,
      used_count: 215,
      expires_at: null,
      is_active: true
    }
  ]

  const displayCoupons = coupons && coupons.length > 0 ? coupons : fallbackCoupons

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-[88rem] mx-auto space-y-12">
          
          {/* Header */}
          <div className="pt-8 pb-6 border-b border-neutral-200/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-brand/10 text-brand-dark text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                <span>Promo & Diskon Eksklusif</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-neutral-950 tracking-tight leading-tight">
                Kupon Penawaran Spesial
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Salin kode kupon di bawah ini dan masukkan pada formulir pemesanan saat checkout untuk menikmati potongan harga langsung.
              </p>
            </div>

            <Link
              href="/packages"
              className="bg-brand hover:bg-brand-dark text-white text-xs font-extrabold px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-brand/30 flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <span>Eksplor Semua Paket</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCoupons.map((coupon) => (
              <PromoCard key={coupon.id} coupon={coupon} />
            ))}
          </div>

          {/* Instructions Box */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto md:mx-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-neutral-950">
                Cara Menggunakan Kode Promo
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                1. Klik tombol <strong>Salin</strong> pada kupon pilihan Anda.<br />
                2. Pilih paket wisata dan tentukan tanggal keberangkatan.<br />
                3. Tempel kode pada kolom voucher di halaman pembayaran untuk mendapatkan potongan instan.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-extrabold text-neutral-900">100% Terverifikasi</p>
                <p className="text-[10px] text-neutral-400">Garansi Potongan Resmi</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
