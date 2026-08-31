import Navbar from '@/components/Navbar'
import AiPlannerClient from './AiPlannerClient'

export const metadata = { title: 'AI Travel Planner — Nova' }

export default function AiPlannerPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900">
      <Navbar />
      <AiPlannerClient />
    </div>
  )
}
