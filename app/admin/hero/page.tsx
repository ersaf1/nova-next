'use client'

import React, { useEffect, useState } from 'react'
import { Upload, Sparkles, CheckCircle, Loader2, Film, Type, Video, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Hero {
  id?: number
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
  const [showPreview, setShowPreview] = useState(true)

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
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setForm(prev => ({ ...prev, videoUrl: data.url }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch {
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
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      alert('Failed to save Hero settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-neutral-400 animate-spin" />
          <p className="text-sm text-neutral-400">Loading hero settings…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-50 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Hero Section</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Hero Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Control headline copy, badge text, and background video for the hero section.
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Text Copy Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200">
                <Type className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <CardTitle>Copy & Messaging</CardTitle>
                <CardDescription className="mt-0.5">The text displayed on the hero section.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Badge Text */}
            <div className="space-y-1.5">
              <Label htmlFor="badgeText">Badge Text</Label>
              <Input
                id="badgeText"
                name="badgeText"
                value={form.badgeText}
                onChange={handleChange}
                placeholder="e.g. Live availability · 150+ countries"
              />
              <p className="text-xs text-neutral-400">Short status label shown at the top of the hero.</p>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Textarea
                id="headline"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                rows={2}
                placeholder={"The World,\nUnlocked."}
                className="font-semibold text-base"
              />
              <p className="text-xs text-neutral-400">Use a new line to split into two lines on the hero.</p>
            </div>

            {/* Subheadline */}
            <div className="space-y-1.5">
              <Label htmlFor="subheadline">Subheadline</Label>
              <Textarea
                id="subheadline"
                name="subheadline"
                value={form.subheadline}
                onChange={handleChange}
                rows={2}
                placeholder="Plan, book, and experience extraordinary journeys…"
              />
            </div>

            {/* Live text preview */}
            {(form.headline || form.subheadline) && (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Preview</p>
                {form.badgeText && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600 mb-3">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    {form.badgeText}
                  </span>
                )}
                {form.headline && (
                  <p className="text-2xl font-bold tracking-tight text-neutral-900 whitespace-pre-line leading-tight mb-2">
                    {form.headline}
                  </p>
                )}
                {form.subheadline && (
                  <p className="text-sm text-neutral-500 leading-relaxed">{form.subheadline}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200">
                  <Video className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <CardTitle>Background Video</CardTitle>
                  <CardDescription className="mt-0.5">Full-screen background video or URL.</CardDescription>
                </div>
              </div>
              {form.videoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(v => !v)}
                  className="text-xs text-neutral-500 gap-1.5"
                >
                  {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Video URL Input */}
            <div className="space-y-1.5">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleChange}
                placeholder="https://example.com/video.mp4"
              />
              <p className="text-xs text-neutral-400">Direct link to an .mp4 file. Supports up to 8K resolution.</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-neutral-400 font-medium">or upload a file</span>
              <Separator className="flex-1" />
            </div>

            {/* File Upload */}
            <div>
              <label
                htmlFor="videoFile"
                className={cn(
                  'flex flex-col items-center justify-center gap-2.5 w-full h-28 rounded-xl border-2 border-dashed transition-all cursor-pointer',
                  uploadingVideo
                    ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed'
                    : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                )}
              >
                {uploadingVideo ? (
                  <>
                    <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                    <span className="text-xs font-medium text-neutral-500">Uploading video…</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200">
                      <Upload className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-semibold text-neutral-700">Click to upload</span>
                      <p className="text-xs text-neutral-400 mt-0.5">MP4, MOV, WebM — up to 8K</p>
                    </div>
                  </>
                )}
                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={uploadingVideo}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Video Preview */}
            {form.videoUrl && showPreview && (
              <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-[#06333a] aspect-video">
                <video
                  key={form.videoUrl}
                  src={form.videoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-[#06333a]/85 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide uppercase">
                    <Film className="w-3 h-3" />
                    Live Preview
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-neutral-400">
            Changes are saved to both local storage and the database.
          </p>
          <div className="flex items-center gap-3">
            {success && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Saved successfully</span>
              </div>
            )}
            <Button type="submit" disabled={saving || uploadingVideo} size="default">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

      </form>
    </div>
  )
}
