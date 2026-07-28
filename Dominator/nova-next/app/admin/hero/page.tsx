'use client'

import React, { useEffect, useState } from 'react'
import { Upload, Video, Sparkles, CheckCircle, Loader2, Film } from 'lucide-react'

interface Hero {
  id: number
  headline: string
  subheadline: string
  badgeText: string
  videoUrl: string
}

export default function HeroAdmin() {
  const [form, setForm] = useState<Omit<Hero, 'id'>>({
    headline: '',
    subheadline: '',
    badgeText: '',
    videoUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.json())
      .then((data: Hero) => {
        setForm({
          headline: data.headline || '',
          subheadline: data.subheadline || '',
          badgeText: data.badgeText || '',
          videoUrl: data.videoUrl || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.url) {
        setForm(prev => ({ ...prev, videoUrl: data.url }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload video file.')
    } finally {
      setUploadingVideo(false)
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
          <p className="text-neutral-500 text-xs mt-1">Edit hero headline copy and upload background videos (up to 8K).</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Copy Section */}
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

        {/* Video Upload Section */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-neutral-500" />
            Background Video File
          </h2>

          <div className="space-y-4">
            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-neutral-500" />
              Hero Background Video (Upload 8K / High-Res Video)
            </label>

            {/* Direct Upload Button */}
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="cursor-pointer bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold px-5 py-3 rounded-xl transition-all flex items-center gap-2.5 shadow-xs">
                {uploadingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Video...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Video File (8K supported)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleChange}
                placeholder="Or paste video URL here..."
                className="flex-1 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              />
            </div>

            {/* Video Live Preview */}
            {form.videoUrl && (
              <div className="mt-4 rounded-xl border border-neutral-200/80 overflow-hidden bg-neutral-950 aspect-video max-h-64 relative group shadow-sm">
                <video
                  key={form.videoUrl}
                  src={form.videoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-semibold tracking-wide uppercase">
                  Video Preview Active
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || uploadingVideo}
            className="bg-neutral-950 text-white text-xs font-semibold px-7 py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Hero Settings...</span>
              </>
            ) : (
              <span>Save Hero Settings</span>
            )}
          </button>

          {success && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Hero video & text saved successfully!</span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
