'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login?tab=signup')
  }, [router])

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <span className="text-xs font-semibold text-stone-400">Mengalihkan ke registrasi...</span>
    </div>
  )
}
