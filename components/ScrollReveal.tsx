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
  duration = 0.9,
  delay = 0,
  stagger = 0.12,
  staggerChildren = false,
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const ease = 'cubic-bezier(0.16, 1, 0.3, 1)'

      let startVars: gsap.TweenVars = { opacity: 0 }
      const endVars: gsap.TweenVars = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }

      switch (animation) {
        case 'slide-up':
          startVars = { opacity: 0, y: 60, filter: 'blur(8px)' }
          break
        case 'slide-down':
          startVars = { opacity: 0, y: -60, filter: 'blur(4px)' }
          break
        case 'slide-left':
          // Enters from the right side
          startVars = { opacity: 0, x: 80, filter: 'blur(6px)' }
          break
        case 'slide-right':
          // Enters from the left side
          startVars = { opacity: 0, x: -80, filter: 'blur(6px)' }
          break
        case 'zoom-in':
          startVars = { opacity: 0, scale: 0.93, filter: 'blur(4px)' }
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
    <div ref={containerRef} style={{ willChange: 'transform, opacity' }} className="w-full">
      {children}
    </div>
  )
}
