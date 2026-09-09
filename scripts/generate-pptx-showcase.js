/**
 * Script Otomatis: Generator Presentasi PowerPoint (.pptx)
 * Menghasilkan file presentasi 16:9 berstandar industri dari seluruh halaman aplikasi
 */
const pptxgen = require('pptxgenjs')
const path = require('path')
const fs = require('fs')

const ts = require('typescript')
const docsContent = fs.readFileSync(path.join(__dirname, '..', 'lib', 'docs-data.ts'), 'utf8')
const transpiled = ts.transpileModule(docsContent, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText

const moduleObj = { exports: {} }
const runFn = new Function('module', 'exports', 'require', transpiled)
runFn(moduleObj, moduleObj.exports, require)
const docPages = moduleObj.exports.DOC_PAGES
console.log(`✅ Berhasil membaca data dari lib/docs-data.ts (${docPages.length} halaman)`)

async function buildPresentation() {
  console.log('🚀 Membangun Presentasi PowerPoint: NOVA TRAVEL Application Showcase...')
  
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9' // 10 x 5.625 inches (16:9 standard)
  pres.author = 'NOVA Travel Engineering'
  pres.company = 'NOVA Travel Luxury Journeys'
  pres.title = 'NOVA TRAVEL — Digital User Guide & Interactive Application Showcase'

  // Skema Warna Brand
  const C_DARK = '141312'
  const C_GOLD = 'D4AF37'
  const C_BG = 'FAF9F6'
  const C_WHITE = 'FFFFFF'
  const C_TEXT = '262626'
  const C_MUTED = '737373'
  const C_BORDER = 'E5E5E5'

  // ==========================================
  // SLIDE 1: COVER SLIDE
  // ==========================================
  const slide1 = pres.addSlide()
  slide1.background = { color: C_DARK }

  // Accent Gold Pill
  slide1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.0, y: 1.2, w: 4.5, h: 0.35,
    fill: { color: '262626' }, line: { color: C_GOLD, width: 1 }, rectRadius: 0.1
  })
  slide1.addText('APPLICATION SHOWCASE & DIGITAL USER GUIDE', {
    x: 1.0, y: 1.2, w: 4.5, h: 0.35,
    fontSize: 9, fontFace: 'Arial', bold: true, color: C_GOLD, align: 'center', valign: 'middle'
  })

  // Title & Brand
  slide1.addText('NOVA TRAVEL', {
    x: 1.0, y: 1.7, w: 8.0, h: 0.9,
    fontSize: 44, fontFace: 'Georgia', bold: true, color: C_WHITE, margin: 0
  })
  slide1.addText('Curated Luxury Journeys — Complete Visual Walkthrough', {
    x: 1.0, y: 2.6, w: 8.0, h: 0.4,
    fontSize: 16, fontFace: 'Arial', color: 'A3A3A3', margin: 0
  })

  // Short paragraph
  slide1.addText('Dokumentasi visual komprehensif yang memetakan seluruh arsitektur halaman, alur reservasi tamu, fitur AI trip planner, dan portal manajemen operasional super admin.', {
    x: 1.0, y: 3.2, w: 7.5, h: 0.8,
    fontSize: 12, fontFace: 'Arial', color: 'D4D4D4', lineSpacing: 18, margin: 0
  })

  // Metric Boxes at Bottom
  const stats = [
    { num: `${docPages.length}`, label: 'Halaman Ditangkap' },
    { num: '72+', label: 'Fitur & Aksi Dianalisis' },
    { num: '3 Roles', label: 'Public, User, Admin' },
    { num: '100%', label: 'Screenshot Browser Nyata' },
  ]
  stats.forEach((s, idx) => {
    const bx = 1.0 + idx * 2.1
    slide1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: bx, y: 4.3, w: 1.9, h: 0.8,
      fill: { color: '1F1E1D' }, line: { color: '333333', width: 1 }, rectRadius: 0.08
    })
    slide1.addText(s.num, {
      x: bx, y: 4.38, w: 1.9, h: 0.35,
      fontSize: 16, fontFace: 'Arial', bold: true, color: C_GOLD, align: 'center'
    })
    slide1.addText(s.label, {
      x: bx, y: 4.75, w: 1.9, h: 0.25,
      fontSize: 9, fontFace: 'Arial', color: 'A3A3A3', align: 'center'
    })
  })

  // ==========================================
  // SLIDE 2: AGENDA / TABLE OF CONTENTS
  // ==========================================
  const slide2 = pres.addSlide()
  slide2.background = { color: C_BG }

  slide2.addText('TABLE OF CONTENTS', {
    x: 0.8, y: 0.6, w: 8.0, h: 0.3,
    fontSize: 10, fontFace: 'Arial', bold: true, color: 'B45309'
  })
  slide2.addText('Struktur & Modul Navigasi Aplikasi', {
    x: 0.8, y: 0.9, w: 8.0, h: 0.5,
    fontSize: 24, fontFace: 'Georgia', bold: true, color: C_DARK
  })

  const sections = [
    {
      title: 'Bagian 1: Public & Discovery (15 Halaman)',
      color: '3B82F6',
      desc: 'Homepage editorial, katalog paket wisata, detail itinerary, eksplorasi destinasi benua, perencana AI cerdas (Gemini AI), FAQ, ulasan tamu, dan alur pendaftaran akun.'
    },
    {
      title: 'Bagian 2: User Booking & Dashboard (11 Halaman)',
      color: '10B981',
      desc: 'Formulir multi-step booking rombongan, integrasi gerbang bayar Midtrans (VA/QRIS/CC), tiket boarding pass digital, wishlist, dan notifikasi akun anggota.'
    },
    {
      title: 'Bagian 3: Admin Portal & CMS (10 Halaman)',
      color: 'EF4444',
      desc: 'Executive analytics dashboard, CRUD katalog tur, kuota keberangkatan, approval refund dana tamu, RBAC hak akses staf, audit log forensik, dan unduh laporan PDF resmi.'
    },
  ]

  sections.forEach((sec, idx) => {
    const sy = 1.6 + idx * 1.2
    slide2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: sy, w: 8.4, h: 1.0,
      fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.1
    })
    slide2.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: sy, w: 0.15, h: 1.0,
      fill: { color: sec.color }
    })
    slide2.addText(sec.title, {
      x: 1.2, y: sy + 0.15, w: 7.8, h: 0.3,
      fontSize: 14, fontFace: 'Arial', bold: true, color: C_DARK
    })
    slide2.addText(sec.desc, {
      x: 1.2, y: sy + 0.45, w: 7.8, h: 0.45,
      fontSize: 10.5, fontFace: 'Arial', color: C_MUTED, lineSpacing: 14
    })
  })

  // ==========================================
  // SLIDES 3 - N: HALAMAN-HALAMAN SCREENSHOT & PENJELASAN
  // ==========================================
  for (let i = 0; i < docPages.length; i++) {
    const p = docPages[i]
    const slide = pres.addSlide()
    slide.background = { color: C_BG }

    // Header Slide
    const roleColor = p.role === 'ADMIN' ? 'EF4444' : p.role === 'USER' ? '2563EB' : '525252'
    
    // Page Number + Role Badge
    slide.addText(`PAGE ${p.pageNumber}`, {
      x: 0.6, y: 0.4, w: 1.2, h: 0.25,
      fontSize: 9, fontFace: 'Arial', bold: true, color: 'B45309'
    })
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.5, y: 0.38, w: 1.1, h: 0.26,
      fill: { color: roleColor }, rectRadius: 0.05
    })
    slide.addText(p.role, {
      x: 1.5, y: 0.38, w: 1.1, h: 0.26,
      fontSize: 8.5, fontFace: 'Arial', bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    })

    // Title
    slide.addText(p.title, {
      x: 0.6, y: 0.65, w: 8.8, h: 0.4,
      fontSize: 20, fontFace: 'Georgia', bold: true, color: C_DARK, margin: 0
    })

    // Subtitle & URL
    slide.addText(`URL: https://novatravel.com${p.urlPath}  •  Kategori: ${p.category}`, {
      x: 0.6, y: 1.05, w: 8.8, h: 0.25,
      fontSize: 9, fontFace: 'Arial', color: C_MUTED, margin: 0
    })

    // -------------------------------------------------------------
    // KIRI: BROWSER MOCKUP DENGAN ACTUAL SCREENSHOT (Width: 5.3 inches)
    // -------------------------------------------------------------
    const imgFile = path.join(__dirname, '..', 'public', p.screenshot.replace(/^\//, ''))
    const hasImage = fs.existsSync(imgFile)

    // Browser Frame Container
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: 1.35, w: 5.3, h: 3.95,
      fill: { color: C_WHITE }, line: { color: 'D4D4D4', width: 1 }, rectRadius: 0.08
    })

    // Browser Window Header bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.35, w: 5.3, h: 0.28,
      fill: { color: 'F5F5F4' }, line: { color: 'E5E5E5', width: 0.5 }
    })
    // 3 Dots
    slide.addShape(pres.shapes.OVAL, { x: 0.65, y: 1.43, w: 0.1, h: 0.1, fill: { color: 'EF4444' } })
    slide.addShape(pres.shapes.OVAL, { x: 0.80, y: 1.43, w: 0.1, h: 0.1, fill: { color: 'F59E0B' } })
    slide.addShape(pres.shapes.OVAL, { x: 0.95, y: 1.43, w: 0.1, h: 0.1, fill: { color: '10B981' } })

    // Address Bar Pill
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.2, y: 1.39, w: 3.2, h: 0.18,
      fill: { color: C_WHITE }, line: { color: 'E5E5E5', width: 0.5 }, rectRadius: 0.04
    })
    slide.addText(`novatravel.com${p.urlPath}`, {
      x: 1.25, y: 1.39, w: 3.1, h: 0.18,
      fontSize: 7.5, fontFace: 'Courier New', color: '525252', valign: 'middle'
    })

    // Actual Screenshot Image
    if (hasImage) {
      slide.addImage({
        path: imgFile,
        x: 0.52, y: 1.63, w: 5.26, h: 3.63,
        sizing: { type: 'cover', w: 5.26, h: 3.63 }
      })
    } else {
      slide.addText('Screenshot Pending Render', {
        x: 0.52, y: 2.8, w: 5.26, h: 0.5,
        fontSize: 12, color: C_MUTED, align: 'center'
      })
    }

    // -------------------------------------------------------------
    // KANAN: PENJELASAN, ANATOMI & FITUR (Lebar Diperluas: 3.65 inches)
    // -------------------------------------------------------------
    const rx = 5.95
    const rw = 3.6

    // Box 1: Page Overview
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: rx, y: 1.35, w: rw, h: 1.05,
      fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.08
    })
    slide.addText('RINGKASAN & FUNGSI UTAMA', {
      x: rx + 0.16, y: 1.43, w: rw - 0.32, h: 0.18,
      fontSize: 8.5, fontFace: 'Arial', bold: true, color: 'B45309'
    })
    slide.addText(p.overview, {
      x: rx + 0.16, y: 1.64, w: rw - 0.32, h: 0.7,
      fontSize: 8, fontFace: 'Arial', color: '333333', lineSpacing: 10.5
    })

    // Box 2: Anatomi Bagian Halaman (Callout Points)
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: rx, y: 2.48, w: rw, h: 1.48,
      fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.08
    })
    slide.addText('ANATOMI & ELEMEN HALAMAN', {
      x: rx + 0.16, y: 2.56, w: rw - 0.32, h: 0.18,
      fontSize: 8.5, fontFace: 'Arial', bold: true, color: '1D4ED8'
    })

    // Rich Text Formatting untuk Anatomi tanpa pemotongan canggung
    const anatomyRuns = []
    const topAnatomy = p.anatomy.slice(0, 3)
    topAnatomy.forEach((a, aIdx) => {
      // Hilangkan pemotongan '...' dan pastikan kalimat berakhir rapi dengan titik
      let desc = a.description.trim()
      if (!desc.endsWith('.')) desc += '.'

      anatomyRuns.push({
        text: `[${a.number}] `,
        options: { bold: true, fontSize: 8, fontFace: 'Arial', color: '2563EB' }
      })
      anatomyRuns.push({
        text: `${a.name}: `,
        options: { bold: true, fontSize: 8, fontFace: 'Arial', color: '171717' }
      })
      anatomyRuns.push({
        text: aIdx < topAnatomy.length - 1 ? `${desc}\n\n` : `${desc}`,
        options: { bold: false, fontSize: 7.5, fontFace: 'Arial', color: '525252' }
      })
    })

    slide.addText(anatomyRuns, {
      x: rx + 0.16, y: 2.78, w: rw - 0.32, h: 1.12,
      lineSpacing: 10
    })

    // Box 3: Fitur & Tombol Tindakan
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: rx, y: 4.04, w: rw, h: 1.26,
      fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.08
    })
    slide.addText('AKSI & TOMBOL PENGGUNA', {
      x: rx + 0.16, y: 4.12, w: rw - 0.32, h: 0.18,
      fontSize: 8.5, fontFace: 'Arial', bold: true, color: '047857'
    })

    // Rich Text Formatting untuk Aksi tanpa pemotongan canggung
    const actionRuns = []
    const topActions = p.actions.slice(0, 3)
    topActions.forEach((act, actIdx) => {
      let actDesc = act.action.trim()
      if (!actDesc.endsWith('.')) actDesc += '.'

      actionRuns.push({
        text: '► ',
        options: { bold: true, fontSize: 7.5, fontFace: 'Arial', color: '059669' }
      })
      actionRuns.push({
        text: `${act.name}: `,
        options: { bold: true, fontSize: 8, fontFace: 'Arial', color: '171717' }
      })
      actionRuns.push({
        text: actIdx < topActions.length - 1 ? `${actDesc}\n\n` : `${actDesc}`,
        options: { bold: false, fontSize: 7.5, fontFace: 'Arial', color: '525252' }
      })
    })

    slide.addText(actionRuns, {
      x: rx + 0.16, y: 4.34, w: rw - 0.32, h: 0.9,
      lineSpacing: 10
    })
  }

  // ==========================================
  // SLIDE PENUTUP: CLOSING & ACCESS
  // ==========================================
  const slideClose = pres.addSlide()
  slideClose.background = { color: C_DARK }

  slideClose.addText('SELESAI & AKSES LIVE', {
    x: 1.0, y: 1.5, w: 8.0, h: 0.3,
    fontSize: 10, fontFace: 'Arial', bold: true, color: C_GOLD
  })
  slideClose.addText('Terima Kasih — Jelajahi Live Showcase', {
    x: 1.0, y: 1.9, w: 8.0, h: 0.7,
    fontSize: 32, fontFace: 'Georgia', bold: true, color: C_WHITE
  })
  slideClose.addText('Dokumentasi interaktif ini dapat diakses secara live kapan saja melalui URL:', {
    x: 1.0, y: 2.7, w: 7.5, h: 0.4,
    fontSize: 13, fontFace: 'Arial', color: 'A3A3A3'
  })

  // URL Box
  slideClose.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.0, y: 3.3, w: 6.0, h: 0.7,
    fill: { color: '262626' }, line: { color: C_GOLD, width: 1 }, rectRadius: 0.1
  })
  slideClose.addText('http://localhost:3000/docs  •  /docs/flow-map', {
    x: 1.0, y: 3.3, w: 6.0, h: 0.7,
    fontSize: 16, fontFace: 'Courier New', bold: true, color: C_GOLD, align: 'center', valign: 'middle'
  })

  // Simpan File PPTX
  const outputPathRoot = path.join(__dirname, '..', 'nova-travel-showcase.pptx')
  const outputPathPublic = path.join(__dirname, '..', 'public', 'docs', 'nova-travel-application-showcase.pptx')

  try {
    await pres.writeFile({ fileName: outputPathRoot })
    console.log(`📁 File 1: ${outputPathRoot}`)
  } catch (err) {
    if (err.code === 'EBUSY') {
      const tempPath = path.join(__dirname, '..', 'nova-travel-showcase-updated.pptx')
      await pres.writeFile({ fileName: tempPath })
      console.log(`⚠️ nova-travel-showcase.pptx sedang terbuka di PowerPoint. Hasil disimpan di: ${tempPath}`)
    } else {
      throw err
    }
  }

  try {
    await pres.writeFile({ fileName: outputPathPublic })
    console.log(`📁 File 2 (Download URL): ${outputPathPublic}`)
  } catch (err) {
    console.warn('Gagal menyimpan public copy:', err.message)
  }

  console.log(`🎉 Berhasil membuat presentasi PowerPoint!`)
}

buildPresentation().catch((err) => {
  console.error('Error saat membangun PPTX:', err)
  process.exit(1)
})
