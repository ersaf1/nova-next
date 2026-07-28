'use client'

import React, { useEffect, useState } from 'react'
import { Upload, Video, Image as ImageIcon, Sparkles, CheckCircle, Loader2, Film } from 'lucide-react'

interface Hero {
  id: number
  headline: string
  subheadline: string
  badgeText: string
  videoUrl: string
  posterUrl: string
}

export default function HeroAdmin() {
  const [form, setForm] = useState<Omit<Hero, 'id'>>({ headline: '', subheadline: '', badgeText: '', videoUrl: '', posterUrl: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Uploading states
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.json())
      .then((data: Hero) => {
        setForm({
          headline: data.headline || '',
          subheadline: data.subheadline || '',
          badgeText: data.badgeText || '',
          videoUrl: data.videoUrl || '',
          posterUrl: data.posterUrl || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'videoUrl' | 'posterUrl') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (fieldName === 'videoUrl') setUploadingVideo(true)
    if (fieldName === 'posterUrl') setUploadingPoster(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.url) {
        setForm(prev => ({ ...prev, [fieldName]: data.url }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file.')
    } finally {
      setUploadingVideo(false)
      setUploadingPoster(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSaving(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setSaving(false)
      alert('Failed to save Hero settings.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Hero Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Hero Section Settings</h1>
          <p className="text-neutral-500 text-xs mt-1">Manage banner text, upload high-definition / 8K video & poster images.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Details Card */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-6 space-y-5 shadow-2xs">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-500" />
            Headline & Copy Content
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">Badge Text</label>
              <input
                type="text"
                name="badgeText"
                value={form.badgeText}
                onChange={handleChange}
                placeholder="e.g. Live availability · 150+ countries"
                className="border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">Headline (Use line breaks for split text)</label>
              <textarea
                name="headline"
                value={form.headline}
                onChange={handleChange}
                rows={2}
                placeholder="The World,\nUnlocked."
                className="border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">Subheadline Description</label>
              <textarea
                name="subheadline"
                value={form.subheadline}
                onChange={handleChange}
                rows={3}
                placeholder="Plan, book, and experience extraordinary journeys..."
                className="border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Media Upload Card */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-neutral-500" />
            Background Video & Poster Media
          </h2>

          {/* Video Upload & URL */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-neutral-500" />
              Hero Background Video (MP4 / WebM / 8K Video)
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <input
                type="text"
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleChange}
                placeholder="Direct video URL or upload file below..."
                className="flex-1 border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />

              <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0">
                {uploadingVideo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading Video...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video File (8K)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => handleFileUpload(e, 'videoUrl')}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            </div>

            {/* Video Live Preview */}
            {form.videoUrl && (
              <div className="mt-3 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-950 aspect-video max-h-56 relative group">
                <video
                  key={form.videoUrl}
                  src={form.videoUrl}
                  controls
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded font-medium">
                  Live Preview
                </div>
              </div>
            )}
          </div>

          {/* Poster Upload & URL */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
              Poster Thumbnail Image (PNG / JPG / 8K Image)
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <input
                type="text"
                name="posterUrl"
                value={form.posterUrl}
                onChange={handleChange}
                placeholder="Direct image URL or upload file below..."
                className="flex-1 border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />

              <label className="cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shrink-0">
                {uploadingPoster ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading Image...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Poster (8K)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e, 'posterUrl')}
                  disabled={uploadingPoster}
                  className="hidden"
                />
              </label>
            </div>

            {/* Poster Live Preview */}
            {form.posterUrl && (
              <div className="mt-3 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-100 max-h-40 relative group w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.posterUrl}
                  alt="Poster preview"
                  className="h-36 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded font-medium">
                  Poster Preview
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || uploadingVideo || uploadingPoster}
            className="bg-neutral-950 text-white text-xs font-semibold px-7 py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Hero Settings</span>
            )}
          </button>

          {success && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Hero settings saved successfully! Changes are live.</span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
