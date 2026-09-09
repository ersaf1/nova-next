'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Maximize2, ExternalLink, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface BrowserFrameProps {
  urlPath: string
  screenshotUrl: string
  title: string
}

export default function BrowserFrame({ urlPath, screenshotUrl, title }: BrowserFrameProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))
  const handleResetZoom = () => setZoomLevel(1)

  return (
    <>
      <div className="w-full rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xl shadow-stone-200/50">
        {/* Browser Top Navigation Bar */}
        <div className="bg-stone-100 border-b border-stone-200/80 px-4 py-3 flex items-center justify-between gap-3">
          {/* Window control buttons */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>

          {/* Browser Address Bar */}
          <div className="flex-1 max-w-xl mx-auto bg-white border border-stone-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-stone-600 shadow-sm font-mono">
            <span className="text-emerald-600 font-bold">https://</span>
            <span className="text-stone-800 font-medium">novatravel.com</span>
            <span className="text-stone-400">{urlPath}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <a
              href={urlPath}
              target="_blank"
              rel="noreferrer"
              title="Buka halaman aktual aplikasi"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={() => setIsFullscreen(true)}
              title="Perbesar Layar Penuh (Fullscreen)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black transition shadow-sm"
            >
              <Maximize2 size={13} />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Screenshot Viewport Container */}
        <div className="relative w-full aspect-[16/10] bg-stone-50 overflow-hidden group cursor-pointer" onClick={() => setIsFullscreen(true)}>
          <Image
            src={screenshotUrl}
            alt={title}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover object-top transition duration-300 group-hover:scale-[1.01]"
            priority
          />
          <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/20 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition duration-200 px-4 py-2 rounded-full bg-stone-900/90 text-white text-xs font-semibold backdrop-blur-sm shadow-lg flex items-center gap-2">
              <Maximize2 size={14} /> Klik untuk Mode Fullscreen & Zoom
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-6 animate-fadeIn">
          {/* Top Floating Control Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between bg-stone-900/90 text-white border border-stone-800 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-lg">
            <div>
              <h3 className="text-sm font-bold text-stone-100">{title}</h3>
              <p className="text-xs text-stone-400 font-mono">https://novatravel.com{urlPath}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-stone-800 rounded-xl p-1 border border-stone-700">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-700 transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono px-2 text-stone-300">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-700 transition"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700 transition ml-1"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Download Image */}
              <a
                href={screenshotUrl}
                download={`${title.toLowerCase().replace(/\s+/g, '-')}.png`}
                className="p-2 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition border border-stone-700"
                title="Download Screenshot"
              >
                <Download size={16} />
              </a>

              {/* Close Fullscreen */}
              <button
                onClick={() => {
                  setIsFullscreen(false)
                  setZoomLevel(1)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white text-stone-900 font-bold text-xs hover:bg-stone-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* Zoomable Image Viewport */}
          <div className="w-full flex-1 overflow-auto flex items-center justify-center p-4 my-2">
            <div
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
              className="relative max-w-6xl w-full rounded-xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotUrl} alt={title} className="w-full h-auto object-contain select-none" />
            </div>
          </div>

          <p className="text-xs text-stone-400">Gunakan kontrol zoom di atas atau klik tombol Tutup untuk kembali ke dokumentasi.</p>
        </div>
      )}
    </>
  )
}
