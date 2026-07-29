'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, Sparkles, MapPin, Play, Star, ChevronRight, Video, Camera } from 'lucide-react'

interface NavButtonProps {
  label: string
  href: string
}

function NavButton({ label, href }: NavButtonProps) {
  return (
    <Link
      href={href}
      className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-medium uppercase text-wandor-text tracking-[0.04em] transition-opacity hover:opacity-55"
    >
      {label}
    </Link>
  )
}

const DESTINATION_PREVIEWS = [
  {
    name: 'Kyoto, Japan',
    tag: 'Autumn Sakura & Hidden Temples',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    prompt: "I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds...."
  },
  {
    name: 'Buenos Aires & Patagonia, Argentina',
    tag: 'Tango & Alpine Glaciers',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    prompt: "I'm planning a 10-day trip to Argentina. I want to explore Buenos Aires tango culture and trek Patagonia glaciers...."
  },
  {
    name: 'Santorini, Greece',
    tag: 'Cliffside Villas & Sunset Cruises',
    rating: 5.0,
    photo: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-beach-with-turquoise-water-41525-large.mp4',
    prompt: "I'm planning a romantic 6-day getaway to Santorini. Looking for luxury overwater villas, wine tasting, and yachting...."
  }
]

export default function HeroSection() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeDestIdx, setActiveDestIdx] = useState(0)
  const [customPrompt, setCustomPrompt] = useState(DESTINATION_PREVIEWS[0].prompt)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(true)

  const currentDest = DESTINATION_PREVIEWS[activeDestIdx]

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name)
    }
  }

  const handlePlanTrip = () => {
    router.push(`/itinerary?prompt=${encodeURIComponent(customPrompt)}`)
  }

  const handleSelectDest = (idx: number) => {
    setActiveDestIdx(idx)
    setCustomPrompt(DESTINATION_PREVIEWS[idx].prompt)
  }

  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-white text-[#1a1a1a]">
      {/* Background Ambient Video (z-0) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
      />

      {/* Top White-to-Transparent Gradient Overlay (z-1) */}
      <div
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Content Wrapper (z-2) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto min-h-svh flex flex-col justify-between">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between px-6 md:px-20 pt-5 md:pt-6 pb-4">
          {/* Left Wordmark Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-[32px] md:text-[40px] text-black leading-none select-none tracking-tight">
              wandor
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-full ml-1 font-sans">
              NOVA AI
            </span>
          </Link>

          {/* Center Links (Hidden on Mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 max-md:hidden">
            <NavButton label="Discover" href="/destinations" />
            <NavButton label="Pricing" href="/packages" />
            <NavButton label="FAQs" href="/how-it-works" />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4 md:gap-8">
            <Link
              href="/login"
              className="max-md:hidden bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-[#292929] tracking-[0.04em] transition-opacity hover:opacity-55"
            >
              Login
            </Link>

            <button
              onClick={handlePlanTrip}
              className="bg-wandor-dark text-[#fafafa] border-none cursor-pointer font-sans text-[15px] font-medium uppercase tracking-[0.04em] px-5 py-3.5 rounded-full transition-all hover:bg-[#333] active:scale-95 shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Plan My Trip</span>
            </button>
          </div>
        </nav>

        {/* Hero Body */}
        <div className="flex flex-col items-center px-6 pt-8 md:pt-12 pb-16 text-center my-auto relative">
          
          {/* Main Headline */}
          <h1 className="font-sans text-[clamp(38px,6vw,68px)] font-medium text-wandor-text leading-[1.05] tracking-[-0.04em] max-w-[820px] mb-4 md:mb-5">
            Where will you go next?
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base md:text-xl font-medium text-wandor-muted leading-relaxed max-w-[520px] mb-8 md:mb-10">
            Tell our AI where you&apos;re going and what you love across 195 countries. We&apos;ll create a personalized itinerary for you.
          </p>

          {/* Destination Preview Mini Switcher Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto max-w-full pb-2 scrollbar-none">
            {DESTINATION_PREVIEWS.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDest(idx)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  activeDestIdx === idx
                    ? 'bg-black text-white shadow-md scale-105'
                    : 'bg-white/70 text-neutral-800 hover:bg-white border border-white/80'
                }`}
              >
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>{dest.name}</span>
              </button>
            ))}
          </div>

          {/* Flex Container for Main Liquid Glass Prompt Card & Floating Destination Media Card */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-full">
            
            {/* Liquid Glass Frosted Prompt Card */}
            <div className="relative w-[701px] max-md:w-[calc(100vw-48px)] min-h-[220px] md:min-h-[238px] bg-white/[0.08] border-[3px] border-white rounded-[44px] shadow-[0_0_15px_0_rgba(0,0,0,0.12)] overflow-hidden backdrop-blur-[20px] p-6 text-left flex flex-col justify-between group transition-all hover:shadow-[0_0_25px_0_rgba(0,0,0,0.18)]">
              
              {/* Top Interactive Destination Photo & Video Banner Badge inside Floating Card */}
              <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-neutral-900 border border-white/60 shrink-0 shadow-xs">
                    <img
                      src={currentDest.photo}
                      alt={currentDest.name}
                      className="w-full h-full object-cover img-smooth-zoom"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-black">{currentDest.name}</span>
                      <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-100/80 px-1.5 py-0.5 rounded-md ml-1">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mr-0.5" />
                        {currentDest.rating}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-neutral-600 block line-clamp-1">{currentDest.tag}</span>
                  </div>
                </div>

                {uploadedFile && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200 truncate max-w-[140px]">
                    📄 {uploadedFile}
                  </span>
                )}
              </div>

              {/* Prompt Text / Interactive Textarea */}
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={2}
                className="w-full font-sans text-base md:text-xl font-medium text-wandor-prompt leading-relaxed bg-transparent border-none focus:outline-none resize-none placeholder:text-wandor-prompt/50"
                placeholder="Describe your dream trip (destination, duration, preferences)..."
              />

              {/* Bottom Actions inside Glass Card */}
              <div className="flex items-center justify-between pt-3 mt-2">
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-11 h-11 bg-white/40 hover:bg-white/80 border border-white/80 rounded-full cursor-pointer flex items-center justify-center backdrop-blur-[14px] transition-all hover:scale-105 active:scale-95 shadow-2xs"
                  aria-label="Upload inspiration"
                  title="Upload itinerary PDF or photo inspiration"
                >
                  <Upload className="w-[18px] h-[18px] text-wandor-text flex-shrink-0" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* "Plan My Trip" CTA Button */}
                <button
                  onClick={handlePlanTrip}
                  className="w-[156px] h-13 md:h-14 bg-black border-none rounded-[44px] shadow-[0_0_2px_0_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-center gap-2 font-sans text-sm md:text-base font-medium text-[#fafafa] uppercase tracking-[0.02em] transition-all hover:bg-[#333] active:scale-95 hover:shadow-lg"
                >
                  <span>Plan My Trip</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Additional Floating Destination Media Card (Live Video & Photo Showcase) */}
            <div className="w-[280px] bg-white/90 backdrop-blur-2xl border-[3px] border-white rounded-[32px] shadow-2xl p-4 text-left space-y-3 animate-float shrink-0 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 flex items-center gap-1">
                  <Video className="w-3 h-3 text-amber-500" /> Live Stream Preview
                </span>
                <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-neutral-400" /> HD Photo
                </span>
              </div>

              {/* Mini Video / Photo Player Frame */}
              <div className="relative h-36 rounded-2xl overflow-hidden bg-neutral-950 border border-white/60 shadow-inner group/media">
                <video
                  src={currentDest.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="text-xs font-bold leading-tight drop-shadow-sm">{currentDest.name}</p>
                  <p className="text-[10px] text-white/80 font-medium">195 UN Countries Collection</p>
                </div>
              </div>

              {/* Photo Showcase Pills */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
                  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
                  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80'
                ].map((img, idx) => (
                  <div key={idx} className="h-12 rounded-xl overflow-hidden border border-white/80 bg-neutral-900">
                    <img src={img} alt="Destination preview" className="w-full h-full object-cover img-smooth-zoom" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Sub-bar */}
        <div className="px-6 md:px-20 pb-6 text-center text-xs text-neutral-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-black/5 pt-4">
          <p>© 2026 Wandor by NOVA. Powered by Gemini AI Concierge.</p>
          <p className="flex items-center gap-4">
            <Link href="/destinations" className="hover:text-black">195 UN Countries</Link>
            <Link href="/packages" className="hover:text-black">All-Inclusive Packages</Link>
            <Link href="/itinerary" className="hover:text-black">AI Planner</Link>
          </p>
        </div>

      </div>
    </section>
  )
}
