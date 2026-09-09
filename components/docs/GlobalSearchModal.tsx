'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, Layers, Zap, MousePointer } from 'lucide-react'
import { DOC_PAGES } from '@/lib/docs-data'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Toggle handled by parent or shortcut
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  const trimmed = query.toLowerCase().trim()

  // Match pages by Title, Subtitle, Features, or Actions
  const results = DOC_PAGES.flatMap((p) => {
    const hits: {
      type: 'page' | 'feature' | 'action'
      title: string
      subtitle: string
      slug: string
      pageNumber: string
      role: string
    }[] = []

    if (!trimmed) return []

    // Match Page
    if (p.title.toLowerCase().includes(trimmed) || p.subtitle.toLowerCase().includes(trimmed) || p.slug.toLowerCase().includes(trimmed)) {
      hits.push({
        type: 'page',
        title: p.title,
        subtitle: p.subtitle,
        slug: p.slug,
        pageNumber: p.pageNumber,
        role: p.role
      })
    }

    // Match Features
    p.features.forEach((f) => {
      if (f.toLowerCase().includes(trimmed)) {
        hits.push({
          type: 'feature',
          title: f,
          subtitle: `Fitur di ${p.title}`,
          slug: p.slug,
          pageNumber: p.pageNumber,
          role: p.role
        })
      }
    })

    // Match Actions
    p.actions.forEach((a) => {
      if (a.name.toLowerCase().includes(trimmed) || a.action.toLowerCase().includes(trimmed)) {
        hits.push({
          type: 'action',
          title: `Tombol [${a.name}]`,
          subtitle: `${a.action} (Halaman ${p.title})`,
          slug: p.slug,
          pageNumber: p.pageNumber,
          role: p.role
        })
      }
    })

    return hits
  }).slice(0, 10)

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 md:pt-24 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50/50">
          <Search size={18} className="text-stone-400" />
          <input
            type="text"
            autoFocus
            placeholder="Cari halaman, fitur, tombol, atau alur (cth: 'Midtrans', 'Kupon', 'Refund', 'Booking')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-stone-400 hover:text-stone-600 p-1">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-stone-200 text-stone-600 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {!trimmed && (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Layers size={24} className="mx-auto mb-2 opacity-50" />
              Ketik kata kunci untuk mencari di seluruh 36 halaman dokumentasi.
            </div>
          )}

          {trimmed && results.length === 0 && (
            <div className="py-12 text-center text-stone-400 text-xs">
              Tidak ditemukan halaman atau fitur yang cocok dengan &quot;{query}&quot;.
            </div>
          )}

          {results.map((item, idx) => (
            <Link
              key={idx}
              href={`/docs/${item.slug}`}
              onClick={onClose}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-stone-100 transition border border-transparent hover:border-stone-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition mt-0.5">
                  {item.type === 'page' && <Layers size={14} />}
                  {item.type === 'feature' && <Zap size={14} />}
                  {item.type === 'action' && <MousePointer size={14} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-amber-700 transition">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-600">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
                </div>
              </div>

              <ArrowRight size={14} className="text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400">
          <span>Tekan ESC untuk menutup</span>
          <span className="font-mono">{results.length} hasil ditemukan</span>
        </div>
      </div>
    </div>
  )
}
