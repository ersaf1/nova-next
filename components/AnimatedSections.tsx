'use client'

import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ScrollReveal'
import StatsBar from '@/components/StatsBar'
import MeetNovaSection from '@/components/MeetNovaSection'

const DestinationsSection = dynamic(() => import('@/components/DestinationsSection'), { ssr: false })
const PackagesSection = dynamic(() => import('@/components/PackagesSection'), { ssr: false })
const HowItWorksSection = dynamic(() => import('@/components/HowItWorksSection'), { ssr: false })
const WhyNovaSection = dynamic(() => import('@/components/WhyNovaSection'), { ssr: false })
const FeaturesHighlightSection = dynamic(() => import('@/components/FeaturesHighlightSection'), { ssr: false })
const ExperiencesSection = dynamic(() => import('@/components/ExperiencesSection'), { ssr: false })
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), { ssr: false })
const BackedBySection = dynamic(() => import('@/components/BackedBySection'), { ssr: false })
const FAQSection = dynamic(() => import('@/components/FAQSection'), { ssr: false })
const AppCtaSection = dynamic(() => import('@/components/AppCtaSection'), { ssr: false })

export default function AnimatedSections() {
  return (
    <>
      <ScrollReveal animation="fade" duration={1} delay={0.1}>
        <StatsBar />
      </ScrollReveal>

      <ScrollReveal animation="slide-right" duration={0.9}>
        <MeetNovaSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-left" duration={0.9}>
        <DestinationsSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-right" duration={0.9}>
        <PackagesSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-left" duration={0.9}>
        <HowItWorksSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-right" duration={0.9}>
        <WhyNovaSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-left" duration={0.9}>
        <FeaturesHighlightSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-right" duration={0.9}>
        <ExperiencesSection />
      </ScrollReveal>

      <ScrollReveal animation="zoom-in" duration={0.9}>
        <TestimonialsSection />
      </ScrollReveal>

      <ScrollReveal animation="slide-left" duration={0.9}>
        <BackedBySection />
      </ScrollReveal>

      <ScrollReveal animation="slide-right" duration={0.9}>
        <FAQSection />
      </ScrollReveal>

      <ScrollReveal animation="zoom-in" duration={0.9}>
        <AppCtaSection />
      </ScrollReveal>
    </>
  )
}
