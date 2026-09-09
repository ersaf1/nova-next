'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X, GitFork, BookOpen } from 'lucide-react'
import GlobalSearchModal from './GlobalSearchModal'

interface DocsHeaderProps {
  onToggleSidebar?: () => void
}

export default function DocsHeader({ onToggleSidebar }: DocsHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="h-16 bg-white border-b border-stone-200/80 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Link href="/docs" className="hover:text-stone-900 transition font-bold text-stone-900">
              User Guide
            </Link>
            <span className="text-stone-300">/</span>
            <span>Application Showcase</span>
          </div>
        </div>

        {/* Center Search Bar Trigger */}
        <div className="flex-1 max-w-md mx-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full bg-stone-100/80 hover:bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-stone-500 transition shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search size={15} className="text-stone-400 group-hover:text-stone-700 transition" />
              <span className="truncate">Cari halaman, tombol, atau fitur...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-stone-200 rounded text-stone-600 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Navigation Shortcut Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/docs/flow-map"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white text-stone-700 hover:text-stone-900 text-xs font-semibold transition"
          >
            <GitFork size={13} className="text-amber-600" />
            <span>Interactive Flow Map</span>
          </Link>
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition shadow-sm"
          >
            Buka Aplikasi
          </Link>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
