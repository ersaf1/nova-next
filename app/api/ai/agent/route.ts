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

  // Build chat history for Gemini (exclude last message — that's the one we're sending)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  for (let i = 0; i < 5; i++) {
    const candidate = response.response.candidates?.[0]
    const parts = candidate?.content?.parts ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const functionCallPart = parts.find((p: any) => p.functionCall)
    if (!functionCallPart?.functionCall) break

    const { name, args } = functionCallPart.functionCall as { name: string; args: Record<string, unknown> }
    const toolResult = await executeToolCall(name, args as Record<string, unknown>, baseUrl)

    if (toolResult.type === 'places') placesResult = toolResult.result

    const functionResponseText =
      toolResult.type === 'error'
        ? toolResult.message
        : toolResult.type === 'places'
          ? JSON.stringify({
              found: toolResult.result.places.length,
              places: toolResult.result.places.slice(0, 5).map(p => ({
                name: p.name,
                address: p.address,
                distance: p.distance,
              })),
            })
          : JSON.stringify(toolResult)

    response = await chat.sendMessage([
      {
        functionResponse: {
          name,
          response: { result: functionResponseText },
        },
      },
    ])
  }

  const text = response.response.text()
  return NextResponse.json({ message: text, places: placesResult })
}
