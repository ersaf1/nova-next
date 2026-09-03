import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import AnimatedSections from '@/components/AnimatedSections'

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <HeroSection />
      <AnimatedSections />
      <Footer />
    </div>
  )
}
