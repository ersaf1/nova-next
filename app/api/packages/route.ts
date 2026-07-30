import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth-server'
import { readFile } from 'fs/promises'
import path from 'path'

const PACKAGES_FILE = path.join(process.cwd(), 'data', 'packages.json')

// Package valid: slug ada, harga wajar, rating ada, highlight ada, duration bukan JSON array
function isValidPackage(p: Record<string, unknown>): boolean {
  return (
    typeof p.slug === 'string' && p.slug.length > 0 &&
    typeof p.rating === 'number' && p.rating > 0 &&
    typeof p.price === 'number' && p.price > 100000 &&
    typeof p.highlight === 'string' && p.highlight.length > 0 &&
    typeof p.duration === 'string' && !p.duration.startsWith('[')
  )
}

function parseIncludes(p: Record<string, unknown>) {
  return {
    ...p,
    includes: Array.isArray(p.includes)
      ? p.includes
      : typeof p.includes === 'string'
      ? (() => { try { return JSON.parse(p.includes as string) } catch { return [] } })()
      : [],
  }
}

async function getLocalPackages() {
  try {
    const data = await readFile(PACKAGES_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed
      .filter(isValidPackage)
      .map(parseIncludes)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('Package').select('*')
    if (!error && data && data.length > 0) {
      const parsed = data
        .filter(isValidPackage)
        .map(parseIncludes)
      if (parsed.length > 0) return NextResponse.json(parsed)
    }
  } catch {
    // Fallback to local json
  }

  const local = await getLocalPackages()
  return NextResponse.json(local)
}

export async function POST(request: Request) {
  const authResult = await requireRole(request, ['admin', 'super_admin'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json()
    const data = { ...body, includes: JSON.stringify(body.includes ?? []) }
    const { data: item, error } = await supabase.from('Package').insert(data).select().single()
    if (error) throw error
    return NextResponse.json({ ...item, includes: JSON.parse(item.includes) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
