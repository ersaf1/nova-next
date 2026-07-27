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
  duration = 0.8,
  delay = 0,
  stagger = 0.1,
  staggerChildren = false,
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Define initial hidden states
      let startVars: gsap.TweenVars = { opacity: 0 }
      const endVars: gsap.TweenVars = {
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }

      switch (animation) {
        case 'slide-up':
          startVars.y = 40
          endVars.y = 0
          break
        case 'slide-down':
          startVars.y = -40
          endVars.y = 0
          break
        case 'slide-left':
          startVars.x = 40
          endVars.x = 0
          break
        case 'slide-right':
          startVars.x = -40
          endVars.x = 0
          break
        case 'zoom-in':
          startVars.scale = 0.95
          endVars.scale = 1
          break
        case 'fade':
        default:
          break
      }

      if (staggerChildren) {
        // Target immediate children of container
        const targets = containerRef.current?.children
        if (targets && targets.length > 0) {
          gsap.fromTo(
            targets,
            startVars,
            {
              ...endVars,
              stagger,
              // Override scrollTrigger config to trigger on individual items
              scrollTrigger: {
                trigger: containerRef.current,
                start: `top ${100 - threshold * 100}%`,
                toggleActions: once ? 'play none none none' : 'play reverse play reverse',
              }
            }
          )
        }
      } else {
        // Target container itself
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
