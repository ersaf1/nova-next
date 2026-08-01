# Plan B: AI Planner Page + MapLibre + Chat Interface

**Date:** 2026-08-01
**Branch:** feature/geoapify-real-places
**Depends on:** Plan A (Geoapify services layer must be complete first)

---

## Goal

Build the /ai-planner page: a chat-based Travel AI Agent powered by Gemini with function calling. The agent understands natural language, geocodes locations via Geoapify, searches real places, and displays results on an interactive MapLibre GL JS map.

Flow: User message -> Gemini (function calling) -> Geoapify APIs -> Real places data -> AI response + Map markers

---

## Prerequisites

- Plan A complete (lib/geoapify/* and /api/geo/* routes exist)
- maplibre-gl installed
- GEOAPIFY_API_KEY in .env.local

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| app/ai-planner/page.tsx | AI Planner page shell (auth check, layout) |
| app/ai-planner/AiPlannerClient.tsx | Main client component: chat UI + map side by side |
| app/api/ai/agent/route.ts | POST - Gemini function calling agent endpoint |
| components/planner/ChatPanel.tsx | Chat messages list + input bar |
| components/planner/ChatMessage.tsx | Single message bubble (user/assistant/places-card) |
| components/planner/PlacesCard.tsx | Rich card showing places list within chat |
| components/planner/MapPanel.tsx | MapLibre map wrapper (dynamic, no SSR) |
| components/planner/LocationSearch.tsx | Autocomplete search bar with debounce |
| lib/ai-agent/tools.ts | Gemini function declarations for geocode + searchPlaces |
| lib/ai-agent/executor.ts | Executes tool calls returned by Gemini |
| lib/ai-agent/types.ts | ChatMessage, AgentTool, PlacesResult types |

### Modified files
| File | Change |
|------|--------|
| components/Navbar.tsx | Add AI Planner nav link |

---

## Global Constraints

- Gemini MUST NOT invent place names, addresses, or coordinates
- All place data shown to user comes exclusively from Geoapify API responses
- MapLibre tiles from MapTiler or OpenFreeMap (free tier, no key needed for basic tiles)
- API key never in client code
- Debounce autocomplete: 350ms
- Default search radius: 5000m
- Max places returned: 10

---
## Task 1 — Install maplibre-gl

**Files:** package.json (via npm)

```bash
npm install maplibre-gl@4.7.1
npm install --save-dev @types/maplibre-gl
```

MapLibre uses OSM-compatible tiles. We use free tiles from openfreemap.org - no key needed.

**Test:** npm run build - no missing module errors.

---

## Task 2 — lib/ai-agent/types.ts

```typescript
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  places?: PlacesResult      // populated when agent calls searchPlaces tool
  location?: { lat: number; lon: number; name: string }  // populated when agent geocodes
  timestamp: number
}

export interface PlacesResult {
  query: string              // what was searched
  location: string           // reference location name
  category: string           // resolved Geoapify category
  places: import('@/lib/geoapify/types').GeoapifyPlace[]
  center: { lat: number; lon: number }
}

export interface AgentIntent {
  intent: 'search_places' | 'geocode' | 'itinerary' | 'general'
  location?: string
  category?: string
  radius?: number
}
```

---

## Task 3 — lib/ai-agent/tools.ts (Gemini function declarations)

```typescript
import type { Tool } from '@google/generative-ai'

// Gemini function declarations for the AI travel agent.
// These tell Gemini what tools it can call - it never invents place data.
export const AGENT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'geocode_location',
        description: 'Convert a location name, address, or landmark to geographic coordinates (lat/lon). Use this before searching for places near a location.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            text: {
              type: 'STRING' as any,
              description: 'The location name or address to geocode, e.g. "Artos Mall Magelang" or "Jakarta Pusat"',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'search_places',
        description: 'Search for real places (cafes, restaurants, hotels, attractions, etc.) near a geographic location. Always geocode first to get coordinates.',
        parameters: {
          type: 'OBJECT' as any,
          properties: {
            latitude: { type: 'NUMBER' as any, description: 'Latitude of the center point' },
            longitude: { type: 'NUMBER' as any, description: 'Longitude of the center point' },
            category: { type: 'STRING' as any, description: 'Type of place to search. Use natural language like "cafe", "hotel", "restaurant", or Geoapify categories like "catering.cafe"' },
            radius: { type: 'NUMBER' as any, description: 'Search radius in meters. Default 5000.' },
            limit: { type: 'NUMBER' as any, description: 'Max results to return. Default 10, max 20.' },
            location_name: { type: 'STRING' as any, description: 'Human-readable name of the reference location, used for display' },
          },
          required: ['latitude', 'longitude', 'category'],
        },
      },
    ],
  },
]
```

---

## Task 4 — lib/ai-agent/executor.ts (tool call executor)

```typescript
import type { PlacesResult } from './types'
import type { GeoapifyPlace } from '@/lib/geoapify/types'
import { mapToGeoapifyCategory } from '@/lib/geoapify/category-map'

interface GeocodeTool { text: string }
interface SearchPlacesTool {
  latitude: number; longitude: number; category: string
  radius?: number; limit?: number; location_name?: string
}

export type ToolCallResult =
  | { type: 'geocode'; lat: number; lon: number; formatted: string }
  | { type: 'places'; result: PlacesResult }
  | { type: 'error'; message: string }

// Executes tool calls server-side by calling our own /api/geo/* routes.
// baseUrl is the Next.js app origin, required for server-to-server fetch.
export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  baseUrl: string
): Promise<ToolCallResult> {
  if (toolName === 'geocode_location') {
    const { text } = args as GeocodeTool
    const res = await fetch(`${baseUrl}/api/geo/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return { type: 'error', message: `Lokasi "${text}" tidak ditemukan.` }
    const data = await res.json()
    return { type: 'geocode', lat: data.lat, lon: data.lon, formatted: data.formatted }
  }

  if (toolName === 'search_places') {
    const { latitude, longitude, category, radius = 5000, limit = 10, location_name } = args as SearchPlacesTool
    const resolvedCategory = mapToGeoapifyCategory(category)
    const res = await fetch(`${baseUrl}/api/geo/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, category: resolvedCategory, radius, limit }),
    })
    if (!res.ok) return { type: 'error', message: 'Gagal mencari tempat.' }
    const data = await res.json()
    const places: GeoapifyPlace[] = data.places ?? []
    return {
      type: 'places',
      result: {
        query: category,
        location: location_name ?? `${latitude},${longitude}`,
        category: resolvedCategory,
        places,
        center: { lat: latitude, lon: longitude },
      },
    }
  }

  return { type: 'error', message: `Unknown tool: ${toolName}` }
}
```

---

## Task 5 — app/api/ai/agent/route.ts (Gemini function calling endpoint)

```typescript
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AGENT_TOOLS } from '@/lib/ai-agent/tools'
import { executeToolCall } from '@/lib/ai-agent/executor'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SYSTEM_PROMPT = `You are Nova, a helpful Travel AI Agent for an Indonesian travel platform.
You help users discover real places: cafes, restaurants, hotels, attractions, and more.

IMPORTANT RULES:
1. NEVER invent or guess place names, addresses, coordinates, or opening hours.
2. ALWAYS use the geocode_location tool first to get coordinates, then use search_places.
3. Only recommend places from the search_places tool results.
4. Respond in the same language the user uses (Indonesian or English).
5. When presenting places, be concise: name, category, distance, address.
6. If no places found, say so honestly. Do not invent alternatives.`

export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const { messages } = await request.json()
  if (!messages?.length) return NextResponse.json({ error: 'messages required' }, { status: 400 })

  const baseUrl = new URL(request.url).origin
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', tools: AGENT_TOOLS })

  // Build chat history for Gemini (exclude system message)
  const history = messages.slice(0, -1).map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({
    history,
    systemInstruction: SYSTEM_PROMPT,
  })

  const lastMessage = messages[messages.length - 1].content
  let response = await chat.sendMessage(lastMessage)
  let placesResult = null

  // Agentic loop: keep executing tool calls until Gemini returns a text response
  while (true) {
    const candidate = response.response.candidates?.[0]
    const parts = candidate?.content?.parts ?? []
    const functionCallPart = parts.find((p: any) => p.functionCall)

    if (!functionCallPart) break

    const { name, args } = functionCallPart.functionCall
    const toolResult = await executeToolCall(name, args, baseUrl)

    if (toolResult.type === 'places') placesResult = toolResult.result

    // Send tool result back to Gemini
    const functionResponseText = toolResult.type === 'error'
      ? toolResult.message
      : toolResult.type === 'places'
        ? JSON.stringify({ found: toolResult.result.places.length, places: toolResult.result.places.slice(0, 5).map(p => ({ name: p.name, address: p.address, distance: p.distance })) })
        : JSON.stringify(toolResult)

    response = await chat.sendMessage([{
      functionResponse: { name, response: { result: functionResponseText } }
    }])
  }

  const text = response.response.text()
  return NextResponse.json({ message: text, places: placesResult })
}
```

---
## Task 6 — components/planner/ChatMessage.tsx + PlacesCard.tsx

### ChatMessage.tsx
```typescript
'use client'
import type { ChatMessage as ChatMessageType } from '@/lib/ai-agent/types'
import PlacesCard from './PlacesCard'

interface Props { message: ChatMessageType }

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="text-xs text-white/40 mb-1 ml-1">Nova AI</div>
        )}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white/10 text-white/90 rounded-tl-sm'
        }`}>
          {message.content}
        </div>
        {message.places && <PlacesCard result={message.places} />}
      </div>
    </div>
  )
}
```

### PlacesCard.tsx
```typescript
'use client'
import type { PlacesResult } from '@/lib/ai-agent/types'
import { MapPin, Clock, Globe } from 'lucide-react'

interface Props {
  result: PlacesResult
  onSelectPlace?: (place: PlacesResult['places'][0]) => void
}

export default function PlacesCard({ result, onSelectPlace }: Props) {
  if (!result.places.length) {
    return (
      <div className="mt-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/50">
        Tidak ada tempat ditemukan dalam radius yang ditentukan.
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/10 text-xs text-white/50">
        {result.places.length} tempat ditemukan dekat {result.location}
      </div>
      <div className="divide-y divide-white/5">
        {result.places.map((place) => (
          <button
            key={place.placeId}
            onClick={() => onSelectPlace?.(place)}
            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
          >
            <div className="font-medium text-sm text-white">{place.name}</div>
            <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2">
              <MapPin size={10} />
              <span>{place.address}</span>
              {place.distance && (
                <span className="text-white/30">· {(place.distance / 1000).toFixed(1)} km</span>
              )}
            </div>
            {place.openingHours && (
              <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                <Clock size={10} /> {place.openingHours}
              </div>
            )}
            {place.website && (
              <div className="text-xs text-blue-400/70 mt-0.5 flex items-center gap-1">
                <Globe size={10} /> {place.website}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Task 7 — components/planner/MapPanel.tsx (MapLibre)

```typescript
'use client'
import { useEffect, useRef } from 'react'
import type { GeoapifyPlace } from '@/lib/geoapify/types'

interface MapMarker {
  lat: number
  lon: number
  name: string
  type: 'reference' | 'place'
  popup?: string
}

interface Props {
  markers: MapMarker[]
  center?: { lat: number; lon: number }
}

export default function MapPanel({ markers, center }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) return

    import('maplibre-gl').then((maplibre) => {
      // Load MapLibre CSS
      if (!document.querySelector('link[href*="maplibre-gl"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
        document.head.appendChild(link)
      }

      const map = new maplibre.Map({
        container: mapRef.current!,
        // OpenFreeMap - free, no key needed
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: center ? [center.lon, center.lat] : [106.8456, -6.2088], // default Jakarta
        zoom: 13,
      })

      mapInstanceRef.current = map

      map.on('load', () => {
        addMarkers(maplibre, map, markers)
      })
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers when they change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.loaded()) return

    import('maplibre-gl').then((maplibre) => {
      // Remove old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      addMarkers(maplibre, map, markers)

      // Fit bounds
      if (markers.length > 1) {
        const lons = markers.map(m => m.lon)
        const lats = markers.map(m => m.lat)
        map.fitBounds(
          [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
          { padding: 50, maxZoom: 15 }
        )
      } else if (markers.length === 1) {
        map.flyTo({ center: [markers[0].lon, markers[0].lat], zoom: 15 })
      }
    })
  }, [markers])

  function addMarkers(maplibre: any, map: any, marks: MapMarker[]) {
    marks.forEach(marker => {
      const el = document.createElement('div')
      el.className = marker.type === 'reference'
        ? 'w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer'
        : 'w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-md cursor-pointer'

      const popup = new maplibre.Popup({ offset: 25 }).setHTML(
        `<div class="text-sm font-medium">${marker.name}</div>${marker.popup ? `<div class="text-xs text-gray-500 mt-1">${marker.popup}</div>` : ''}`
      )

      const m = new maplibre.Marker({ element: el })
        .setLngLat([marker.lon, marker.lat])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(m)
    })
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 text-xs text-black/40 bg-white/80 px-2 py-0.5 rounded">
        © OpenStreetMap contributors
      </div>
    </div>
  )
}
```

---

## Task 8 — components/planner/LocationSearch.tsx (autocomplete with debounce)

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { AutocompleteSuggestion } from '@/lib/geoapify/types'

interface Props {
  onSelect: (suggestion: AutocompleteSuggestion) => void
  placeholder?: string
}

export default function LocationSearch({ onSelect, placeholder = 'Cari lokasi...' }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setOpen(false); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      try {
        const res = await fetch(`/api/geo/autocomplete?text=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setOpen(true)
      } catch {
        // AbortError is expected on rapid typing
      } finally {
        setLoading(false)
      }
    }, 350) // 350ms debounce per spec
  }, [query])

  function handleSelect(s: AutocompleteSuggestion) {
    setQuery(s.formatted)
    setSuggestions([])
    setOpen(false)
    onSelect(s)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/20 focus-within:border-white/40 transition-colors">
        <Search size={14} className="text-white/40 shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); setOpen(false) }}>
            <X size={14} className="text-white/40 hover:text-white/70" />
          </button>
        )}
        {loading && <div className="w-3 h-3 border border-white/30 border-t-white/70 rounded-full animate-spin" />}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-start gap-2"
            >
              <Search size={12} className="text-white/30 mt-0.5 shrink-0" />
              <span>{s.formatted}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Task 9 — components/planner/ChatPanel.tsx

```typescript
'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import type { ChatMessage as ChatMessageType, PlacesResult } from '@/lib/ai-agent/types'
import ChatMessageComponent from './ChatMessage'

interface Props {
  onPlacesFound: (result: PlacesResult) => void
}

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content: 'Halo! Aku Nova, travel AI agent kamu. Tanya aku soal tempat wisata, cafe, hotel, atau restoran di mana saja. Contoh: "Cari cafe dekat Artos Mall Magelang"',
  timestamp: Date.now(),
}

export default function ChatPanel({ onPlacesFound }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages.filter(m => m.id !== 'welcome'), userMsg]
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
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

      setMessages(prev => [...prev, assistantMsg])
      if (data.places) onPlacesFound(data.places)
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Coba lagi ya.',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map(msg => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Tanya Nova tentang tempat wisata..."
            disabled={loading}
            className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/30 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-3 py-2.5 transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Task 10 — app/ai-planner/AiPlannerClient.tsx + page.tsx

### AiPlannerClient.tsx
```typescript
'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import ChatPanel from '@/components/planner/ChatPanel'
import LocationSearch from '@/components/planner/LocationSearch'
import type { PlacesResult } from '@/lib/ai-agent/types'
import type { AutocompleteSuggestion } from '@/lib/geoapify/types'

const MapPanel = dynamic(() => import('@/components/planner/MapPanel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center">
      <span className="text-white/30 text-sm">Memuat peta...</span>
    </div>
  ),
})

interface MapMarker {
  lat: number; lon: number; name: string
  type: 'reference' | 'place'; popup?: string
}

export default function AiPlannerClient() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | undefined>()

  function handlePlacesFound(result: PlacesResult) {
    const newMarkers: MapMarker[] = [
      { lat: result.center.lat, lon: result.center.lon, name: result.location, type: 'reference' },
      ...result.places.map(p => ({
        lat: p.lat, lon: p.lon, name: p.name, type: 'place' as const,
        popup: `${p.address}${p.distance ? ` · ${(p.distance/1000).toFixed(1)} km` : ''}`,
      })),
    ]
    setMarkers(newMarkers)
    setMapCenter(result.center)
  }

  function handleLocationSelect(suggestion: AutocompleteSuggestion) {
    if (suggestion.lat && suggestion.lon) {
      setMapCenter({ lat: suggestion.lat, lon: suggestion.lon })
      setMarkers([{ lat: suggestion.lat, lon: suggestion.lon, name: suggestion.formatted, type: 'reference' }])
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left: Chat */}
      <div className="w-[420px] shrink-0 bg-white/5 rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-white/10">
          <LocationSearch onSelect={handleLocationSelect} placeholder="Cari lokasi referensi..." />
        </div>
        <ChatPanel onPlacesFound={handlePlacesFound} />
      </div>

      {/* Right: Map */}
      <div className="flex-1">
        <MapPanel markers={markers} center={mapCenter} />
      </div>
    </div>
  )
}
```

### app/ai-planner/page.tsx
```typescript
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Navbar from '@/components/Navbar'
import AiPlannerClient from './AiPlannerClient'

export const metadata = { title: 'AI Travel Planner — Nova' }

export default async function AiPlannerPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/ai-planner')

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <AiPlannerClient />
    </div>
  )
}
```

---

## Task 11 — Build verification

```bash
npm run build
```

Expected: zero TypeScript errors, zero missing modules.

Check: MapLibre SSR errors - confirm MapPanel is imported with ssr: false.

---

## Self-review checklist

- [ ] GEOAPIFY_API_KEY never referenced in client components
- [ ] Gemini SYSTEM_PROMPT explicitly forbids inventing place data
- [ ] Agentic loop handles multi-step tool calls (geocode then search)
- [ ] ChatPanel shows loading state during agent processing
- [ ] MapPanel dynamically imported with ssr: false
- [ ] LocationSearch debounce is 350ms, uses AbortController for cancellation
- [ ] PlacesCard shows user-friendly empty state when no places found
- [ ] /ai-planner route redirects unauthenticated users to /login
- [ ] MapLibre CSS loaded dynamically
- [ ] Build passes clean

---

## Out of scope (Phase 7 - separate plan)
- Full Routing API implementation (stub exists in lib/geoapify/routing.ts)
- Route polyline display on map
