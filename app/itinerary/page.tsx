'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ItineraryRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/ai-planner') }, [router])
  return null
}
