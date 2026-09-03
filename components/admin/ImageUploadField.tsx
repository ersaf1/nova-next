'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  helperText?: string
  aspectRatio?: 'video' | 'square' | 'wide'
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  helperText = 'Format: JPG, PNG, WEBP, GIF (Maks. 10MB)',
  aspectRatio = 'video',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, WebP, GIF).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 10 MB.')
      return
    }

    setUploading(true)
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        onChange(data.url)
      } else {
        alert(data.error || 'Gagal mengunggah gambar.')
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat mengunggah gambar.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const ratioClass =
    aspectRatio === 'square'
      ? 'h-36 w-36'
      : aspectRatio === 'wide'
      ? 'h-40 w-full'
      : 'h-48 w-full'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={12} />
            Gambar Terpasang
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {value ? (
        /* Preview with Replace & Remove actions */
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs">
          <img
            src={value}
            alt={label}
            className={`w-full object-cover ${aspectRatio === 'square' ? 'h-36' : 'h-48'} transition-opacity group-hover:opacity-80`}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={14} />
              <span>Ganti Gambar</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={uploading}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Hapus gambar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Drag and Drop / Click Upload Box */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${ratioClass} ${
            dragOver
              ? 'border-blue-600 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/20'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-blue-600" />
              </div>
              <p className="text-xs font-bold text-blue-600">Mengunggah ke storage...</p>
              <p className="text-[10px] text-slate-400">Harap tunggu sebentar</p>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
                <Upload size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  <span className="text-blue-600 underline underline-offset-2">Klik untuk upload</span> atau drag & drop file
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{helperText}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
