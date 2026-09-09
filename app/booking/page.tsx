'use client'

import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfessionalBookingFlow from '@/components/booking/ProfessionalBookingFlow'
import BookingPage from '@/components/BookingPage'
import { Suspense } from 'react'

function BookingRouteInner() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('packageId')
  const departureId = searchParams.get('departureId')

  // If packageId is explicitly specified or requested as checkout flow, use the luxury professional checkout flow
  if (packageId) {
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

  // Fallback to destination discovery wizard if no packageId is provided
  return <BookingPage />
}

export default function BookingRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
        </div>
      }
    >
      <BookingRouteInner />
    </Suspense>
  )
}

