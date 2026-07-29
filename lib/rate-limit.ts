// Rate limiter — uses Upstash Redis when env vars are set, falls back to in-memory for dev
import { NextResponse } from 'next/server'

// In-memory store (dev fallback)
const store = new Map<string, { count: number; reset: number }>()

function inMemoryCheck(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

interface RateLimitConfig {
  limit: number
  windowMs: number
  windowStr: string // e.g. "10 m", "1 m"
}

const LIMITS: Record<string, RateLimitConfig> = {
  signup:  { limit: 5,  windowMs: 10 * 60 * 1000, windowStr: '10 m' },
  login:   { limit: 10, windowMs: 10 * 60 * 1000, windowStr: '10 m' },
  booking: { limit: 10, windowMs: 60 * 1000,       windowStr: '1 m'  },
  review:  { limit: 5,  windowMs: 60 * 1000,       windowStr: '1 m'  },
  payment: { limit: 5,  windowMs: 60 * 1000,       windowStr: '1 m'  },
}

let upstashClient: import('@upstash/redis').Redis | null = null
const upstashLimiters = new Map<string, import('@upstash/ratelimit').Ratelimit>()

async function getUpstashLimiter(type: string): Promise<import('@upstash/ratelimit').Ratelimit | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  if (upstashLimiters.has(type)) return upstashLimiters.get(type)!
  try {
    const { Redis } = await import('@upstash/redis')
    const { Ratelimit } = await import('@upstash/ratelimit')
    if (!upstashClient) upstashClient = Redis.fromEnv()
    const cfg = LIMITS[type]
    const limiter = new Ratelimit({
      redis: upstashClient,
      limiter: Ratelimit.slidingWindow(cfg.limit, cfg.windowStr as `${number} ${'s' | 'm' | 'h' | 'd'}`),
      analytics: false,
    })
    upstashLimiters.set(type, limiter)
    return limiter
  } catch { return null }
}

export async function rateLimit(type: string, identifier: string): Promise<NextResponse | null> {
  const cfg = LIMITS[type]
  if (!cfg) return null

  const upstash = await getUpstashLimiter(type)
  let allowed: boolean

  if (upstash) {
    const result = await upstash.limit(`${type}:${identifier}`)
    allowed = result.success
  } else {
    allowed = inMemoryCheck(`${type}:${identifier}`, cfg.limit, cfg.windowMs)
  }

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }
  return null
}
