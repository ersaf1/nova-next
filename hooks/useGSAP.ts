'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useGSAPFadeUp(stagger = 0.1) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const elements = ref.current.querySelectorAll('[data-gsap="fade-up"]')
    if (!elements.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(elements,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            once: true,
          }
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [stagger])

  return ref
}

export function useGSAPStagger(stagger = 0.08) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const elements = ref.current.querySelectorAll('[data-gsap="stagger"]')
    if (!elements.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(elements,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 75%',
            once: true,
          }
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [stagger])

  return ref
}
