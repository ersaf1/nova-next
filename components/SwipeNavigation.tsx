'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface SwipeRoute {
  path: string
  label: string
}

interface SwipeNavigationProps {
  routes: SwipeRoute[]
  enabled?: boolean
}

export default function SwipeNavigation({ routes, enabled = true }: SwipeNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [indicator, setIndicator] = useState<{ label: string; direction: 'left' | 'right' } | null>(null)

  const accumulatedX = useRef(0)
  const isLocked = useRef(false)
  const resetTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const currentIndex = routes.findIndex(
      (r) => r.path === pathname || (r.path !== '/' && r.path !== '/admin' && pathname.startsWith(r.path))
    )

    if (currentIndex === -1) return

    const navigateTo = (direction: 'left' | 'right') => {
      let targetIndex = -1
      if (direction === 'left') {
        // Swiping left means moving to the next item on the right
        if (currentIndex < routes.length - 1) {
          targetIndex = currentIndex + 1
        }
      } else {
        // Swiping right means moving to the previous item on the left
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1
        }
      }

      if (targetIndex !== -1) {
        const target = routes[targetIndex]
        isLocked.current = true
        setIndicator({ label: target.label, direction })

        router.push(target.path)

        setTimeout(() => {
          setIndicator(null)
          isLocked.current = false
          accumulatedX.current = 0
        }, 700)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (isLocked.current) return

      // Only handle horizontal swipes where deltaX is dominant
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)

      if (absX < 20 || absX < absY * 1.3) return

      // Check if user is scrolling inside a horizontal scroll container (like a table)
      const target = e.target as HTMLElement | null
      if (target) {
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        if (isInput) return

        const scrollContainer = target.closest('.overflow-x-auto, [data-scrollable-x]') as HTMLElement | null
        if (scrollContainer) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
          const maxScroll = scrollWidth - clientWidth
          if (e.deltaX > 0 && scrollLeft < maxScroll - 15) return
          if (e.deltaX < 0 && scrollLeft > 15) return
        }
      }

      accumulatedX.current += e.deltaX

      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => {
        accumulatedX.current = 0
      }, 350)

      // Threshold to trigger page swipe
      if (accumulatedX.current > 85) {
        accumulatedX.current = 0
        navigateTo('left')
      } else if (accumulatedX.current < -85) {
        accumulatedX.current = 0
        navigateTo('right')
      }
    }

    // Touch support (2 fingers or strong horizontal swipe)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isLocked.current || e.changedTouches.length === 0) return
      const diffX = touchStartX.current - e.changedTouches[0].clientX
      const diffY = touchStartY.current - e.changedTouches[0].clientY

      if (Math.abs(diffX) > 75 && Math.abs(diffX) > Math.abs(diffY) * 1.6) {
        if (diffX > 0) {
          navigateTo('left')
        } else {
          navigateTo('right')
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [routes, pathname, enabled, router])

  if (!indicator) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-2xl backdrop-blur-md border border-slate-700/80">
        {indicator.direction === 'right' && (
          <ArrowLeft size={16} className="text-[#0099FF] animate-pulse" />
        )}
        <span>Menuju: {indicator.label}</span>
        {indicator.direction === 'left' && (
          <ArrowRight size={16} className="text-[#0099FF] animate-pulse" />
        )}
      </div>
    </div>
  )
}
