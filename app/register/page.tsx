'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login?tab=signup')
  }, [router])

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <span className="text-sm text-neutral-400">Mengalihkan...</span>
    </div>
  )
}
