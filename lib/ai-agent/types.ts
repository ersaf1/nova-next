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
