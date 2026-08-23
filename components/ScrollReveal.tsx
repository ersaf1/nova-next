'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollRevealProps {
  children: React.ReactNode
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in'
  duration?: number
  delay?: number
  stagger?: number
  staggerChildren?: boolean
  threshold?: number
  once?: boolean
}

export default function ScrollReveal({
  children,
  animation = 'slide-up',
  duration = 0.55,
  delay = 0,
  stagger = 0.08,
  staggerChildren = false,
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const ease = 'power2.out'

      let startVars: gsap.TweenVars = { opacity: 0 }
      const endVars: gsap.TweenVars = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 92%',
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }

      switch (animation) {
        case 'slide-up':
          startVars = { opacity: 0, y: 24 }
          break
        case 'slide-down':
          startVars = { opacity: 0, y: -24 }
          break
        case 'slide-left':
          startVars = { opacity: 0, x: 28 }
          break
        case 'slide-right':
          startVars = { opacity: 0, x: -28 }
          break
        case 'zoom-in':
          startVars = { opacity: 0, scale: 0.97 }
          break
        case 'fade':
        default:
          startVars = { opacity: 0 }
          break
      }

      if (staggerChildren) {
        const targets = containerRef.current?.children
        if (targets && targets.length > 0) {
          gsap.fromTo(targets, startVars, {
            ...endVars,
            stagger,
            scrollTrigger: {
              trigger: containerRef.current,
              start: `top ${100 - threshold * 100}%`,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          })
        }
      } else {
        gsap.fromTo(containerRef.current, startVars, endVars)
      }
    }, containerRef)

    return () => ctx.revert()
  }, [animation, duration, delay, stagger, staggerChildren, threshold, once])

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  )
}
