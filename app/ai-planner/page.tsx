import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Navbar from '@/components/Navbar'
import AiPlannerClient from './AiPlannerClient'

export const metadata = { title: 'AI Travel Planner — Nova' }

export default async function AiPlannerPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/ai-planner')

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900">
      <Navbar />
      <AiPlannerClient />
    </div>
  )
}
