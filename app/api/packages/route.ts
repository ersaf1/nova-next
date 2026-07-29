import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import path from 'path'

const PACKAGES_FILE = path.join(process.cwd(), 'data', 'packages.json')

async function getLocalPackages() {
  try {
    const data = await readFile(PACKAGES_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.map((p: { includes: string } & Record<string, unknown>) => ({
      ...p,
      includes: typeof p.includes === 'string' ? JSON.parse(p.includes) : p.includes,
    }))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('Package').select('*')
    if (!error && data && data.length > 0) {
      const parsed = data.map((p: { includes: string } & Record<string, unknown>) => ({
        ...p,
        includes: typeof p.includes === 'string' ? JSON.parse(p.includes) : p.includes,
      }))
      return NextResponse.json(parsed)
    }
  } catch {
    // Fallback to local json
  }

  const local = await getLocalPackages()
  return NextResponse.json(local)
}

export async function POST(request: Request) {
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
