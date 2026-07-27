import type { Metadata } from 'next'
import './globals.css'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'NOVA — Travel Smarter',
  description: 'Your AI-powered travel companion — from first search to safe return.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
