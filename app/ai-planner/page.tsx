import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AiPlannerClient from './AiPlannerClient'

export const metadata = { title: 'Smart Route Planner | Nova' }

export default function AiPlannerPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900">
      <Navbar />
      <AiPlannerClient />
      <Footer />
    </div>
  )
}
