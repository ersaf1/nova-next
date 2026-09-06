'use client'

import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ScrollReveal'
import StatsBar from '@/components/StatsBar'
import FlashDealsBanner from '@/components/FlashDealsBanner'
import MeetNovaSection from '@/components/MeetNovaSection'

const DestinationsSection = dynamic(() => import('@/components/DestinationsSection'), { ssr: false })
const PackagesSection = dynamic(() => import('@/components/PackagesSection'), { ssr: false })
const HowItWorksSection = dynamic(() => import('@/components/HowItWorksSection'), { ssr: false })
const FeaturesHighlightSection = dynamic(() => import('@/components/FeaturesHighlightSection'), { ssr: false })
const ExperiencesSection = dynamic(() => import('@/components/ExperiencesSection'), { ssr: false })
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), { ssr: false })
const FAQSection = dynamic(() => import('@/components/FAQSection'), { ssr: false })
const AppCtaSection = dynamic(() => import('@/components/AppCtaSection'), { ssr: false })

export default function AnimatedSections() {
  return (
    <>
      {/* Flash Sale Promo Voucher Banner */}
      <FlashDealsBanner />

      {/* Trust Stats Counter Bar */}
      <ScrollReveal animation="fade" duration={0.8}>
        <StatsBar />
      </ScrollReveal>

      {/* Top Curated Destinations */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <DestinationsSection />
      </ScrollReveal>

      {/* Curated Tour Packages */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <PackagesSection />
      </ScrollReveal>

      {/* Meet Nova Feature Highlights */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <MeetNovaSection />
      </ScrollReveal>

      {/* How It Works 4-Step Pipeline */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <HowItWorksSection />
      </ScrollReveal>

      {/* Features Spotlight / Interactive Showcase */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <FeaturesHighlightSection />
      </ScrollReveal>

      {/* Travel Modes (Solo, Family, Adventure, Luxury) */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <ExperiencesSection />
      </ScrollReveal>

      {/* Verified Traveler Testimonials & Guest Pledge */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* Travel FAQ Accordion */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <FAQSection />
      </ScrollReveal>

      {/* Member Privileges & Concierge CTA */}
      <ScrollReveal animation="slide-up" duration={0.8}>
        <AppCtaSection />
      </ScrollReveal>
    </>
  )
}
