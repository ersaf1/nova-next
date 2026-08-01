'use client'

import React, { useEffect, useRef, useState } from 'react'

interface TextScrambleProps {
  text: string
  className?: string
  trigger?: boolean // external trigger, defaults to IntersectionObserver
  speed?: number    // ms per frame
  as?: keyof React.JSX.IntrinsicElements
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

export default function TextScramble({
  text,
  className = '',
  trigger,
  speed = 40,
  as: Tag = 'span',
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scramble = () => {
    let iteration = 0
    const totalFrames = text.length * 3

    const tick = () => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < Math.floor(iteration / 3)) return text[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )

      iteration++
      if (iteration <= totalFrames) {
        frameRef.current = setTimeout(tick, speed)
      } else {
        setDisplay(text)
      }
    }

    tick()
  }

  // External trigger support
  useEffect(() => {
    if (trigger === true && !started) {
      setStarted(true)
      scramble()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  // IntersectionObserver auto-trigger
  useEffect(() => {
    if (trigger !== undefined) return // controlled externally
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          scramble()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frameRef.current) clearTimeout(frameRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} aria-label={text}>
      {display}
    </Tag>
  )
}
