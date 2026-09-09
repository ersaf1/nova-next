'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DOC_PAGES, DocRole } from '@/lib/docs-data'
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  GitFork,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Compass,
  CreditCard,
  UserCheck
} from 'lucide-react'

export default function DocsHomePage() {
  const [selectedRole, setSelectedRole] = useState<DocRole | 'ALL'>('ALL')

  const filteredPages = DOC_PAGES.filter((p) => {
    if (selectedRole === 'ALL') return true
    return p.role === selectedRole
  })

  const totalPages = DOC_PAGES.length
  const totalFeatures = DOC_PAGES.reduce((acc, p) => acc + p.features.length, 0)
  const totalScreenshots = DOC_PAGES.length

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-16 animate-fadeIn">
      {/* Editorial Luxury Book Cover Hero */}
      <section className="relative rounded-3xl bg-stone-900 text-white overflow-hidden p-8 md:p-14 border border-stone-800 shadow-2xl shadow-stone-900/20">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-amber-300">
            <Sparkles size={13} />
            <span>Digital User Guide & Live Application Showcase</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif-luxury font-bold tracking-tight text-white leading-tight">
            NOVA TRAVEL
            <span className="block text-xl md:text-2xl font-sans font-normal text-stone-300 mt-2 tracking-normal">
              Complete Visual Guide & Interactive Documentation
            </span>
          </h1>

          <p className="text-sm md:text-base text-stone-300 leading-relaxed font-light">
            Panduan interaktif visual untuk memahami seluruh arsitektur, alur transaksi, fitur, dan fungsi halaman dari platform reservasi liburan mewah Nova Travel. Dilengkapi screenshot aktual dari browser, anatomi komponen, dan peta navigasi interaktif.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/docs/home"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
            >
              <BookOpen size={16} />
              <span>Mulai Membaca Panduan (01. Home)</span>
            </Link>
            <Link
              href="/docs/flow-map"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition"
            >
              <GitFork size={16} />
              <span>Buka Interactive Flow Map</span>
            </Link>
            <a
              href="/docs/nova-travel-application-showcase.pptx"
              download="nova-travel-application-showcase.pptx"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Unduh Presentasi PPTX (16:9)</span>
            </a>
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
          <div>
            <span className="block text-2xl md:text-3xl font-bold font-mono text-amber-400">{totalPages}</span>
            <span className="text-xs text-stone-400 font-medium">Halaman Terdokumentasi</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-bold font-mono text-white">{totalFeatures}+</span>
            <span className="text-xs text-stone-400 font-medium">Fitur & Aksi Dianalisis</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-bold font-mono text-white">3</span>
            <span className="text-xs text-stone-400 font-medium">Peran Akses (Public, User, Admin)</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl font-bold font-mono text-emerald-400">{totalScreenshots}</span>
            <span className="text-xs text-stone-400 font-medium">Screenshot Aktual Browser</span>
          </div>
        </div>
      </section>

      {/* Role Filter & Table of Contents Header */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-serif-luxury font-bold text-stone-900">
              Daftar Isi Dokumentasi (Table of Contents)
            </h2>
            <p className="text-xs md:text-sm text-stone-500">
              Pilih halaman yang ingin Anda eksplorasi atau saring berdasarkan peran pengguna.
            </p>
          </div>

          {/* Role selector buttons */}
          <div className="inline-flex p-1 bg-stone-200/70 rounded-2xl text-xs font-bold text-stone-700">
            {(['ALL', 'PUBLIC', 'USER', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                  selectedRole === r
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Page Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Link
              key={page.slug}
              href={`/docs/${page.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-stone-400 hover:shadow-xl hover:shadow-stone-200/60 transition duration-300 flex flex-col"
            >
              {/* Mini Screenshot Preview Frame */}
              <div className="relative w-full aspect-[16/10] bg-stone-100 border-b border-stone-100 overflow-hidden">
                <Image
                  src={page.screenshot}
                  alt={page.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-top transition duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-sm">
                  #{page.pageNumber}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow-sm ${
                      page.role === 'ADMIN'
                        ? 'bg-rose-500 text-white'
                        : page.role === 'USER'
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-800 text-stone-200'
                    }`}
                  >
                    {page.role}
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    <span>{page.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition">
                    {page.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {page.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span className="font-mono text-stone-400 text-[11px]">{page.urlPath}</span>
                  <span className="flex items-center gap-1 text-stone-900 group-hover:text-amber-600 group-hover:translate-x-1 transition">
                    Pelajari <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
