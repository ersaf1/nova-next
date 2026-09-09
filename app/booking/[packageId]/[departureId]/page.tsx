'use client'

import { use } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfessionalBookingFlow from '@/components/booking/ProfessionalBookingFlow'

export default function BookingFlowPage({
  params,
}: {
  params: Promise<{ packageId: string; departureId: string }>
}) {
  const { packageId, departureId } = use(params)

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight">
            Pemesanan Perjalanan <span className="font-serif-luxury italic font-normal text-stone-800">NOVA Luxury</span>
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-normal">
            Lengkapi data pemesan dan tamu untuk mengamankan tiket keberangkatan resmi Anda.
          </p>
        </div>

        <ProfessionalBookingFlow
          packageIdParam={packageId}
          departureIdParam={departureId}
        />
      </main>
      <Footer />
    </div>
  )
}

