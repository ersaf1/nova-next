'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/ai-agent/types'
import PlacesCard from './PlacesCard'

interface Props {
  message: ChatMessageType
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="text-xs text-white/40 mb-1 ml-1">Nova AI</div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white/10 text-white/90 rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
        {message.places && <PlacesCard result={message.places} />}
      </div>
    </div>
  )
}
