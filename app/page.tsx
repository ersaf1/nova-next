import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import AnimatedSections from '@/components/AnimatedSections'

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#FAF9F6] text-[#1C1917] selection:bg-[#EAE5D9] selection:text-[#1C1917]">
      <Navbar />
      <HeroSection />
      <AnimatedSections />
      <Footer />
    </div>
  )
}
