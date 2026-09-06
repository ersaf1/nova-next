import type { Metadata } from 'next'
import { Urbanist, Instrument_Serif, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/PageTransition'
import SmoothScroll from '@/components/SmoothScroll'
import CrispChat from '@/components/CrispChat'
import { CurrencyProvider } from '@/context/CurrencyContext'
import SwipeNavigation from '@/components/SwipeNavigation'

const PUBLIC_SWIPE_ROUTES = [
  { path: '/', label: 'Beranda' },
  { path: '/destinations', label: 'Destinasi Global' },
  { path: '/packages', label: 'Paket Wisata' },
  { path: '/ai-planner', label: 'Smart Planner' },
  { path: '/promo', label: 'Promo Spesial' },
  { path: '/how-it-works', label: 'Cara Pesan' },
]

const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400'],
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const title = 'Nova | Curated Travel Platform'
const description = 'Platform perjalanan kurasi terpercaya: rancang rute harian terpadu, tur privat bintang 5, dan pendampingan concierge 24 jam.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'),
  title,
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'id_ID',
    siteName: 'Nova Travel',
    images: [{ url: '/nova_official_logo.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/nova_official_logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${urbanist.variable} ${instrumentSerif.variable} ${plusJakartaSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Urbanist:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#FAF9F6] text-[#1C1917] overflow-x-hidden selection:bg-[#EAE5D9] selection:text-[#1C1917]">
        <CurrencyProvider>
          <SmoothScroll>
            <PageTransition>{children}</PageTransition>
          </SmoothScroll>
          <SwipeNavigation routes={PUBLIC_SWIPE_ROUTES} />
        </CurrencyProvider>
        <CrispChat />
      </body>
    </html>
  )
}
