'use client'

import ScrollReveal from '@/components/ScrollReveal'
import StatsBar from '@/components/StatsBar'
import MeetNovaSection from '@/components/MeetNovaSection'
import DestinationsSection from '@/components/DestinationsSection'
import PackagesSection from '@/components/PackagesSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import WhyNovaSection from '@/components/WhyNovaSection'
import FeaturesHighlightSection from '@/components/FeaturesHighlightSection'
import ExperiencesSection from '@/components/ExperiencesSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import BackedBySection from '@/components/BackedBySection'
import FAQSection from '@/components/FAQSection'
import AppCtaSection from '@/components/AppCtaSection'

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
