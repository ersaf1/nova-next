'use client'

import React, { useState } from 'react'
import { Compass, Copy, Check, MapPin, CalendarCheck } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/ai-agent/types'
import PlacesCard from './PlacesCard'

interface Props {
  message: ChatMessageType
  onOpenMap?: () => void
  onOpenBooking?: () => void
}

function renderFormattedContent(content: string) {
  const lines = content.split('\n')

  return lines.map((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) {
      return <div key={idx} className="h-2" />
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
          <span>{parseInlineMarkdown(trimmed.replace('### ', ''))}</span>
        </h4>
      )
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-2">
          {parseInlineMarkdown(trimmed.replace('## ', ''))}
        </h3>
      )
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s+/, '')
      return (
        <div key={idx} className="flex items-start gap-2 text-white/90 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
          <span className="leading-relaxed">{parseInlineMarkdown(itemText)}</span>
        </div>
      )
    }

    // Numbered lists (e.g. 1. or 2.)
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (numberMatch) {
      const num = numberMatch[1]
      const text = numberMatch[2]
      return (
        <div key={idx} className="flex items-start gap-2.5 text-white/90 my-1.5 pl-1">
          <span className="w-5 h-5 rounded-full bg-white/10 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
            {num}
          </span>
          <span className="leading-relaxed">{parseInlineMarkdown(text)}</span>
        </div>
      )
    }

    // Regular paragraph
    return (
      <p key={idx} className="leading-relaxed text-white/90 my-1">
        {parseInlineMarkdown(line)}
      </p>
    )
  })
}

function parseInlineMarkdown(text: string) {
  // Replace **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export default function ChatMessage({ message, onOpenMap, onOpenBooking }: Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border shadow-xs ${
          isUser 
            ? 'bg-neutral-800 border-white/20 text-white text-xs font-bold' 
            : 'bg-brand border-white/20 text-white'
        }`}>
          {isUser ? 'U' : <Compass size={14} className="text-white" />}
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-white/70">
              {isUser ? 'Anda' : 'Nova Assistant'}
            </span>
            <span className="text-[10px] text-white/30" suppressHydrationWarning>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div
            className={`rounded-2xl px-4 sm:px-5 py-3.5 text-sm leading-relaxed ${
              isUser
                ? 'bg-neutral-800 border border-white/10 text-white rounded-tr-xs shadow-md'
                : 'bg-neutral-900/90 border border-white/[0.08] text-white/95 rounded-tl-xs shadow-lg'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="space-y-0.5">{renderFormattedContent(message.content)}</div>
            )}
          </div>

          {/* Place recommendations card if available */}
          {message.places && (
            <div className="mt-3">
              <PlacesCard result={message.places} />
            </div>
          )}

          {/* Assistant Actions Bar (ChatGPT-style) */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 hover:bg-white/5 px-2 py-1 rounded-lg transition-colors"
                title="Salin jawaban"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              {message.places && onOpenMap && (
                <button
                  onClick={onOpenMap}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:bg-blue-950/40 px-2 py-1 rounded-lg border border-blue-500/20 transition-colors"
                >
                  <MapPin size={11} />
                  <span>Buka Peta</span>
                </button>
              )}

              {onOpenBooking && (
                <button
                  onClick={onOpenBooking}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/20 transition-colors"
                >
                  <CalendarCheck size={11} />
                  <span>Jadikan Booking</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
