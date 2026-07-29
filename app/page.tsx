import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import AnimatedSections from '@/components/AnimatedSections'

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#F5F5F5]">
      <Navbar />
      <HeroSection />
      <AnimatedSections />
      <Footer />
    </div>
  )
}
