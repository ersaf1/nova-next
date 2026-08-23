'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

export default function CrispChat() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!websiteId) return // No-op if not configured

    let script: HTMLScriptElement | null = null
    let loaded = false

    const loadScript = () => {
      if (loaded) return
      loaded = true

      window.$crisp = []
      window.CRISP_WEBSITE_ID = websiteId

      script = document.createElement('script')
      script.src = 'https://client.crisp.chat/l.js'
      script.async = true
      document.head.appendChild(script)

      cleanupListeners()
    }

    const cleanupListeners = () => {
      window.removeEventListener('scroll', loadScript)
      window.removeEventListener('mousemove', loadScript)
      window.removeEventListener('touchstart', loadScript)
    }

    // Load on first interaction or fallback timer (3.5s)
    window.addEventListener('scroll', loadScript, { passive: true, once: true })
    window.addEventListener('mousemove', loadScript, { passive: true, once: true })
    window.addEventListener('touchstart', loadScript, { passive: true, once: true })

    const timer = setTimeout(loadScript, 3500)

    return () => {
      clearTimeout(timer)
      cleanupListeners()
      if (script && script.parentNode) {
        try { script.parentNode.removeChild(script) } catch {}
      }
    }
  }, [])

  return null
}
