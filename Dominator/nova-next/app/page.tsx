import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
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
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <MeetNovaSection />
      <DestinationsSection />
      <PackagesSection />
      <HowItWorksSection />
      <WhyNovaSection />
      <FeaturesHighlightSection />
      <ExperiencesSection />
      <TestimonialsSection />
      <BackedBySection />
      <FAQSection />
      <AppCtaSection />
      <Footer />
    </div>
  )
}
