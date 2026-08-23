'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimationOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasAnimated(true)
          if (once) observer.unobserve(el)
        } else if (!once && hasAnimated) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once, hasAnimated])

  return { ref, isVisible }
}

export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.innerHeight - rect.top
      setOffset(scrolled * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { ref, offset }
}

export function use3DTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setTilt({ x: dy * -7, y: dx * 7 })
      })
    }

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setTilt({ x: 0, y: 0 })
      })
    }

    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return { ref, tilt }
}

/**
 * useStaggerReveal — animates each direct child of the container individually,
 * alternating from left/right with stagger delay.
 */
export function useStaggerReveal(options: {
  stagger?: number
  duration?: number
  distance?: number
  once?: boolean
} = {}) {
  const { stagger = 0.1, duration = 0.7, distance = 60, once = true } = options
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const ctx = gsap.context(() => {
      const children = Array.from(container.children) as HTMLElement[]
      if (!children.length) return

      // Set initial state without heavy blur
      children.forEach((child) => {
        gsap.set(child, {
          opacity: 0,
          y: 28,
        })
      })

      ScrollTrigger.create({
        trigger: container,
        start: 'top 90%',
        once,
        onEnter: () => {
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          })
        },
      })
    }, container)

    return () => ctx.revert()
  }, [stagger, duration, distance, once])

  return { ref }
}

