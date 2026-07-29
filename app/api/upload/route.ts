import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'application/pdf',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  // 1. Require authentication
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    // 2. Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 3. Validate MIME type against allowlist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: JPEG, PNG, WebP, GIF, MP4, PDF' },
        { status: 400 }
      )
    }

    // 4. Validate file size (max 10 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10 MB.' },
        { status: 400 }
      )
    }

    // 5. Upload to Supabase Storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename: replace spaces and special chars with dashes
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '-')
    const storagePath = `uploads/${Date.now()}-${sanitizedName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('nova-uploads')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // 6. Return public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('nova-uploads')
      .getPublicUrl(storagePath)

    return NextResponse.json(
      { url: urlData.publicUrl, path: storagePath, size: file.size },
      { status: 201 }
    )
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
