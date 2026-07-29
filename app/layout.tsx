import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/PageTransition'
import CrispChat from '@/components/CrispChat'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const title = 'Nova — Travel Platform'
const description = 'Your AI-powered travel companion — from first search to safe return across 195 countries.'

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
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Special+Elite&family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-[#1a1a1a] overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
        <CrispChat />
      </body>
    </html>
  )
}
