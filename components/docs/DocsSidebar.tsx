'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DOC_PAGES, DocRole } from '@/lib/docs-data'
import { BookOpen, Compass, ShieldCheck, UserCheck, Layers, GitFork, ArrowLeft } from 'lucide-react'

interface DocsSidebarProps {
  selectedRole?: DocRole | 'ALL'
  onSelectRole?: (role: DocRole | 'ALL') => void
  onCloseMobile?: () => void
}

export default function DocsSidebar({
  selectedRole = 'ALL',
  onSelectRole,
  onCloseMobile
}: DocsSidebarProps) {
  const pathname = usePathname()

  // Filter list by role if selected
  const filteredPages = DOC_PAGES.filter((p) => {
    if (selectedRole === 'ALL') return true
    return p.role === selectedRole
  })

  // Group by category
  const categories = Array.from(new Set(filteredPages.map((p) => p.category)))

  const totalPages = DOC_PAGES.length
  const currentActiveIndex = DOC_PAGES.findIndex((p) => `/docs/${p.slug}` === pathname)
  const progressText = currentActiveIndex >= 0 ? `${currentActiveIndex + 1} / ${totalPages} pages` : `${totalPages} pages`

  return (
    <aside className="w-full md:w-80 h-full bg-[#FAF9F6] border-r border-stone-200/80 flex flex-col shrink-0 select-none">
      {/* Brand & Guide Title */}
      <div className="p-5 border-b border-stone-200/80 bg-white">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition">
            <ArrowLeft size={13} />
            <span>Kembali ke Website</span>
          </Link>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            v2.4 Live
          </span>
        </div>

        <Link href="/docs" className="block group">
          <h1 className="text-lg font-bold text-stone-900 font-serif-luxury tracking-tight group-hover:text-amber-700 transition">
            NOVA TRAVEL
          </h1>
          <p className="text-xs text-stone-500 font-medium">Digital User Guide & Showcase</p>
        </Link>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen size={13} className="text-stone-400" />
            Dokumentasi Lengkap
          </span>
          <span className="font-mono text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
            {progressText}
          </span>
        </div>
      </div>

      {/* Role Switcher Pill Bar */}
      <div className="px-4 py-3 bg-stone-50/70 border-b border-stone-200/80">
        <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          <span>Filter Modul Peran</span>
        </div>
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/60 rounded-xl text-xs font-semibold text-stone-600">
          {(['ALL', 'PUBLIC', 'USER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onSelectRole?.(r)}
              className={`py-1.5 rounded-lg text-center transition cursor-pointer text-[11px] ${
                selectedRole === r
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Static Links (Flow Map, TOC) */}
      <div className="px-4 py-2 border-b border-stone-200/60 bg-white space-y-1">
        <Link
          href="/docs"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            pathname === '/docs'
              ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Layers size={15} className="text-stone-400" />
          <span>Table of Contents</span>
        </Link>
        <Link
          href="/docs/flow-map"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
            pathname === '/docs/flow-map'
              ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <GitFork size={15} className="text-stone-400" />
          <span>Interactive Flow Map</span>
        </Link>
      </div>

      {/* Navigation Tree by Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {categories.map((cat) => {
          const pagesInCat = filteredPages.filter((p) => p.category === cat)
          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <span>{cat}</span>
                <span className="font-mono text-[9px]">{pagesInCat.length}</span>
              </div>

              <div className="space-y-0.5">
                {pagesInCat.map((page) => {
                  const isActive = pathname === `/docs/${page.slug}`
                  return (
                    <Link
                      key={page.slug}
                      href={`/docs/${page.slug}`}
                      onClick={onCloseMobile}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                        isActive
                          ? 'bg-stone-900 text-white font-bold shadow-sm'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`font-mono text-[10px] w-5 shrink-0 ${isActive ? 'text-amber-400 font-bold' : 'text-stone-400 group-hover:text-stone-600'}`}>
                          {page.pageNumber}
                        </span>
                        <span className="truncate">{page.title}</span>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : page.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : page.role === 'USER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {page.role}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
