'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  }, [])

  return <div ref={ref}>{children}</div>
}
