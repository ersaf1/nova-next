'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, ArrowRight, X, Sparkles, RefreshCw, CalendarCheck } from 'lucide-react'
import type { ChatMessage as ChatMessageType, PlacesResult } from '@/lib/ai-agent/types'
import type { TravelPackage } from '@/lib/types'
import ChatMessageComponent from './ChatMessage'
import AIConvertBookingModal from './AIConvertBookingModal'

interface Props {
  onPlacesFound: (result: PlacesResult) => void
  activeLocation?: string | null
  setActiveLocation?: (location: string | null) => void
}

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Halo! Aku Nova, AI Travel Concierge pribadi kamu. Tanyakan rekomendasi tempat wisata tersembunyi, cafe estetik, hotel, rute perjalanan, atau kuliner terbaik di seluruh dunia!',
  timestamp: Date.now(),
}

const STARTER_PROMPTS = [
  { icon: '🏝️', label: 'Hidden gems & cafe sunset di Bali', prompt: 'Cari hidden gems cafe sunset dan beach club terbaik di Canggu & Uluwatu Bali' },
  { icon: '🗼', label: 'Spot wisata & kuliner di Tokyo', prompt: 'Rekomendasi tempat wisata menarik dan kuliner autentik di Shibuya dan Shinjuku Tokyo' },
  { icon: '⛰️', label: 'Itinerary pegunungan Swiss Alps', prompt: 'Buatkan rencana jalan-jalan dan spot pemandangan terbaik di Zermatt dan Interlaken Swiss' },
  { icon: '🏛️', label: 'Tur sejarah & gelato di Roma', prompt: 'Cari tempat bersejarah dan kedai gelato terbaik dekat Colosseum Roma' },
]

export default function ChatPanel({ onPlacesFound, activeLocation, setActiveLocation }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [packages, setPackages] = useState<TravelPackage[]>([])

  // Fetch packages on mount
  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPackages(data)
      })
      .catch(err => console.error('Error fetching packages:', err))
  }, [])

  // Find matching package when activeLocation changes
  const matchingPackage = useMemo(() => {
    if (!activeLocation || packages.length === 0) {
      return null
    }

    const cleanLoc = activeLocation.toLowerCase().trim()
    const parts = cleanLoc.split(',').map(p => p.trim())

    // 1. Try exact country name match first
    for (const part of parts) {
      const match = packages.find(pkg => 
        (pkg.subtitle ?? '').toLowerCase().includes(part) || 
        pkg.title.toLowerCase().includes(part) ||
        (pkg.category ?? '').toLowerCase() === part
      )
      if (match) {
        return match
      }
    }

    // 2. Fallback to broad substring matches
    const fallbackMatch = packages.find(pkg => {
      return cleanLoc.includes(pkg.title.toLowerCase()) ||
        pkg.title.toLowerCase().includes(cleanLoc) ||
        (pkg.subtitle ?? '').toLowerCase().includes(cleanLoc)
    })

    return fallbackMatch ?? null
  }, [activeLocation, packages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    const history = [...messages.filter((m) => m.id !== 'welcome'), userMsg]
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Agent error')
      const data = await res.json()

      const assistantMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        places: data.places ?? undefined,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      if (data.places) {
        onPlacesFound(data.places)
        if (setActiveLocation) {
          setActiveLocation(data.places.location)
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Maaf, terjadi sedikit kendala koneksi dengan AI. Silakan coba ulangi pertanyaanmu ya!',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleResetChat = () => {
    setMessages([WELCOME_MESSAGE])
    if (setActiveLocation) setActiveLocation(null)
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Header Actions */}
      <div className="px-6 py-2 border-b border-white/[0.06] flex items-center justify-between gap-2 shrink-0 bg-[#052a2f]/45">
        <div className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemini 2.0 AI Agent</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1 rounded-full transition-all"
              title="Konversi rencana ini ke booking"
            >
              <CalendarCheck size={12} />
              <span>Booking</span>
            </button>
          )}
          {messages.length > 1 && (
            <button
              onClick={handleResetChat}
              className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
              title="Mulai percakapan baru"
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}

        {/* Starter Suggestion Chips (Visible on initial state) */}
        {messages.length === 1 && (
          <div className="mt-4 space-y-2 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
              Inspirasi pertanyaan cepat:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={loading}
                  className="text-left text-xs bg-white/[0.04] hover:bg-white/[0.09] active:scale-[0.98] border border-white/[0.07] hover:border-white/20 p-3 rounded-2xl transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2 text-white/85">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <ArrowRight size={13} className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-1.5 items-center py-2 px-3 bg-white/5 rounded-2xl w-fit border border-white/5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-white/50 ml-1.5">Nova sedang mencari tempat & menganalisis...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Active location pill */}
      {activeLocation && (
        <div className="mx-4 sm:mx-6 mb-2 shrink-0 animate-fade-in">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.09] shadow-md">
            <span className="text-xs text-white/60 font-medium truncate">📍 {activeLocation}</span>
            <div className="flex items-center gap-2 shrink-0">
              {matchingPackage && (
                <a
                  href={`/packages/${matchingPackage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  Lihat paket <ArrowRight size={11} />
                </a>
              )}
              <button
                onClick={() => setActiveLocation && setActiveLocation(null)}
                className="text-white/40 hover:text-white transition-colors p-1"
                aria-label="Tutup lokasi"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:p-6 pt-2 shrink-0">
        <div className="flex gap-2 items-center bg-white/[0.06] border border-white/[0.1] rounded-2xl px-4 py-3 focus-within:border-white/30 focus-within:bg-white/[0.09] transition-all shadow-lg">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya rekomendasi tempat wisata, hotel, cafe..."
            disabled={loading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-white/30 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            aria-label="Kirim"
            className="w-8 h-8 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 active:scale-90"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

      {/* Convert to Live Booking Modal */}
      {showBookingModal && (
        <AIConvertBookingModal
          itineraryTitle={`Rencana Perjalanan AI ${activeLocation ? `- ${activeLocation}` : ''}`}
          destination={activeLocation || 'Destinasi AI Custom'}
          durationDays={3}
          estimatedBudgetIDR={8500000}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  )
}
