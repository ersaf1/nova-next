import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DOC_PAGES } from '@/lib/docs-data'
import BrowserFrame from '@/components/docs/BrowserFrame'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  MousePointer,
  CheckCircle2,
  Share2,
  ChevronRight,
  Layers,
  ArrowDown
} from 'lucide-react'

export function generateStaticParams() {
  return DOC_PAGES.map((p) => ({
    slug: p.slug,
  }))
}

export default async function DocDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pageIndex = DOC_PAGES.findIndex((p) => p.slug === slug)

  if (pageIndex === -1) {
    notFound()
  }

  const page = DOC_PAGES[pageIndex]
  const prevPage = pageIndex > 0 ? DOC_PAGES[pageIndex - 1] : null
  const nextPage = pageIndex < DOC_PAGES.length - 1 ? DOC_PAGES[pageIndex + 1] : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12 animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <div className="space-y-4 border-b border-stone-200 pb-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <Link href="/docs" className="hover:text-stone-900 transition">
            Dokumentasi
          </Link>
          <ChevronRight size={13} className="text-stone-300" />
          <span>{page.category}</span>
          <ChevronRight size={13} className="text-stone-300" />
          <span className="text-stone-900 font-bold">{page.title}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                PAGE {page.pageNumber}
              </span>
              <span
                className={`text-xs font-mono px-3 py-0.5 rounded-full font-bold shadow-xs ${
                  page.role === 'ADMIN'
                    ? 'bg-rose-500 text-white'
                    : page.role === 'USER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-800 text-stone-200'
                }`}
              >
                ROLE: {page.role}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-serif-luxury font-bold text-stone-950 tracking-tight">
              {page.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={page.urlPath}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
            >
              Uji Halaman Live ↗
            </a>
          </div>
        </div>

        <p className="text-sm md:text-base text-stone-600 font-normal leading-relaxed">
          {page.subtitle}
        </p>
      </div>

      {/* 2. ACTUAL BROWSER FRAME SCREENSHOT VIEWER */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
            ● Screenshot Aktual Aplikasi (High Resolution Browser View)
          </h2>
          <span className="text-[11px] text-stone-400">Klik gambar untuk Fullscreen & Zoom</span>
        </div>

        <BrowserFrame
          urlPath={page.urlPath}
          screenshotUrl={page.screenshot}
          title={page.title}
        />
      </section>

      {/* 3. PAGE OVERVIEW */}
      <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={16} />
          <span>Page Overview & Tujuan Utama</span>
        </div>
        <p className="text-sm md:text-base text-stone-700 leading-relaxed font-normal">
          {page.overview}
        </p>
      </section>

      {/* 4. ANATOMY / BAGIAN-BAGIAN HALAMAN */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-stone-700" />
          <h2 className="text-lg font-bold text-stone-900 font-serif-luxury">
            Anatomi & Bagian-Bagian Halaman
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.anatomy.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-4 hover:border-amber-400 transition group"
            >
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                {item.number}
              </span>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition">
                  {item.name}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURES & ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Features List */}
        <section className="bg-white rounded-3xl p-7 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm font-serif-luxury">
            <Zap size={16} className="text-amber-600" />
            <span>Fitur Utama di Halaman Ini</span>
          </div>

          <ul className="space-y-3">
            {page.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions & Buttons */}
        <section className="bg-white rounded-3xl p-7 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm font-serif-luxury">
            <MousePointer size={16} className="text-blue-600" />
            <span>Tombol & Interaksi yang Tersedia</span>
          </div>

          <div className="space-y-2.5">
            {page.actions.map((act, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-stone-900 bg-stone-200/70 px-2 py-0.5 rounded text-[11px]">
                    [{act.name}]
                  </span>
                  <p className="text-stone-500 mt-1">{act.action}</p>
                </div>
                {act.targetUrl && (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 shrink-0">
                    → {act.targetUrl}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 6. USER FLOW VISUAL */}
      <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-stone-900 font-serif-luxury">
          Alur Penggunaan Halaman (User Journey Flow)
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {page.userFlow.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-stone-900 text-stone-100 text-xs font-semibold shadow-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
              {idx < page.userFlow.length - 1 && (
                <ArrowRight size={16} className="text-stone-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. RELATED PAGES */}
      {page.relatedPages.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
            Halaman Terkait (Related Pages)
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {page.relatedPages.map((rel) => (
              <Link
                key={rel.slug}
                href={`/docs/${rel.slug}`}
                className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-xs font-semibold text-stone-800 hover:text-amber-900 transition flex items-center gap-1.5 shadow-xs"
              >
                <span>{rel.title}</span>
                <ArrowRight size={13} className="text-stone-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. PREVIOUS & NEXT PRESENTATION NAVIGATION */}
      <div className="pt-8 border-t border-stone-200 flex items-center justify-between gap-4">
        {prevPage ? (
          <Link
            href={`/docs/${prevPage.slug}`}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 transition text-left"
          >
            <div className="p-2 rounded-xl bg-stone-100 group-hover:bg-stone-900 group-hover:text-white transition">
              <ArrowLeft size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Halaman Sebelumnya
              </span>
              <span className="text-xs font-bold text-stone-900 group-hover:text-amber-700 transition">
                {prevPage.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPage ? (
          <Link
            href={`/docs/${nextPage.slug}`}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-400 transition text-right"
          >
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Halaman Selanjutnya
              </span>
              <span className="text-xs font-bold text-stone-900 group-hover:text-amber-700 transition">
                {nextPage.title}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-stone-100 group-hover:bg-stone-900 group-hover:text-white transition">
              <ArrowRight size={16} />
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
