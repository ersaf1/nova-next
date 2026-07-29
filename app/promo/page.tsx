import { Tag, ShoppingBag } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-medium mb-4">
            <Tag className="w-4 h-4" /> Promo Tersedia
          </div>
          <h1 className="text-4xl font-bold mb-3">Penawaran Spesial</h1>
          <p className="text-white/50 text-lg">Gunakan kode promo berikut saat checkout untuk mendapatkan diskon</p>
        </div>

        {!coupons || coupons.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Belum ada promo tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <PromoCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}

        <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
          <h2 className="text-xl font-semibold mb-2">Cara Pakai Kode Promo</h2>
          <p className="text-white/50 text-sm">Salin kode promo, lalu masukkan di halaman checkout saat melakukan pemesanan paket wisata.</p>
        </div>
      </div>
    </div>
  )
}
