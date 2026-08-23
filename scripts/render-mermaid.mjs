import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INPUT_MD_PATH = path.resolve(__dirname, '../.opencode/plans/FLOW-NOVA.md')
const OUTPUT_DIR = path.resolve(__dirname, '../docs/diagrams')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function extractMermaidDiagrams(markdownContent) {
  const lines = markdownContent.split(/\r?\n/)
  const diagrams = []
  
  let currentSection = 'Diagram'
  let insideMermaid = false
  let currentCode = []
  let count = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      currentSection = line.replace(/^##\s+/, '').trim()
    }

    if (line.trim().startsWith('```mermaid')) {
      insideMermaid = true
      currentCode = []
      continue
    }

    if (insideMermaid && line.trim().startsWith('```')) {
      insideMermaid = false
      count++
      
      const safeTitle = currentSection
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      diagrams.push({
        id: count,
        title: currentSection,
        filename: `${String(count).padStart(2, '0')}-${safeTitle}`,
        code: currentCode.join('\n').trim(),
      })
      continue
    }

    if (insideMermaid) {
      currentCode.push(line)
    }
  }

  return diagrams
}

async function launchBrowser() {
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  }

  try {
    return await puppeteer.launch({ ...launchOptions, channel: 'chrome' })
  } catch {
    try {
      return await puppeteer.launch({ ...launchOptions, channel: 'msedge' })
    } catch {
      try {
        return await puppeteer.launch({
          ...launchOptions,
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        })
      } catch {
        return await puppeteer.launch(launchOptions)
      }
    }
  }
}

async function renderDiagrams() {
  console.log('\x1b[1m\x1b[36m=======================================================')
  console.log('   NOVA TRAVEL — MERMAID DIAGRAM RENDERER (PUPPETEER)')
  console.log('=======================================================\x1b[0m')

  if (!fs.existsSync(INPUT_MD_PATH)) {
    console.error(`\x1b[31m[ERROR] File not found: ${INPUT_MD_PATH}\x1b[0m`)
    process.exit(1)
  }

  const markdown = fs.readFileSync(INPUT_MD_PATH, 'utf8')
  const diagrams = extractMermaidDiagrams(markdown)

  console.log(`\n\x1b[33mFound ${diagrams.length} Mermaid diagram(s) in FLOW-NOVA.md\x1b[0m\n`)
  console.log(`Saving diagrams to: \x1b[34m${OUTPUT_DIR}\x1b[0m\n`)

  const browser = await launchBrowser()
  const page = await browser.newPage()

  await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: 2 })

  const baseHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Renderer</title>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 40px;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          display: inline-block;
        }
        #container {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          display: inline-block;
          min-width: 600px;
        }
        .header {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #0f172a;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
        }
        #diagram-target {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div id="container">
        <div class="header" id="diagram-title"></div>
        <div id="diagram-target"></div>
      </div>
    </body>
    </html>
  `

  await page.setContent(baseHtml, { waitUntil: 'domcontentloaded' })

  // Initialize mermaid in page
  await page.evaluate(() => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis'
      }
    })
  })

  let successCount = 0

  for (const diag of diagrams) {
    console.log(`\x1b[1mRendering [${diag.id}/${diagrams.length}]:\x1b[0m ${diag.title}...`)

    try {
      const renderResult = await page.evaluate(async (title, code, id) => {
        try {
          document.getElementById('diagram-title').textContent = title
          const res = await window.mermaid.render(`svg_${id}_${Date.now()}`, code)
          document.getElementById('diagram-target').innerHTML = res.svg
          return { success: true, svg: res.svg }
        } catch (err) {
          return { success: false, error: err.message }
        }
      }, diag.title, diag.code, diag.id)

      if (!renderResult.success) {
        throw new Error(renderResult.error || 'Mermaid render failed')
      }

      const pngPath = path.join(OUTPUT_DIR, `${diag.filename}.png`)
      const svgPath = path.join(OUTPUT_DIR, `${diag.filename}.svg`)

      fs.writeFileSync(svgPath, renderResult.svg, 'utf8')

      const containerElem = await page.$('#container')
      await containerElem.screenshot({
        path: pngPath,
        omitBackground: false,
      })

      console.log(`  \x1b[32m✓ Exported:\x1b[0m ${diag.filename}.png & .svg`)
      successCount++
    } catch (err) {
      console.log(`  \x1b[31m✗ Failed:\x1b[0m ${err.message}`)
    }
  }

  // Generate HTML gallery
  const galleryHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>NOVA — Architecture & Flow Diagrams</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; margin: 0; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { font-size: 28px; margin-bottom: 8px; color: #38bdf8; }
        p { color: #94a3b8; margin-bottom: 32px; }
        .card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 24px; margin-bottom: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
        .card h2 { font-size: 20px; margin-top: 0; margin-bottom: 16px; color: #f1f5f9; }
        .img-container { background: #ffffff; border-radius: 8px; padding: 20px; overflow-x: auto; text-align: center; }
        img { max-width: 100%; height: auto; }
        .links { margin-top: 14px; font-size: 14px; }
        .links a { color: #38bdf8; text-decoration: none; margin-right: 16px; font-weight: 500; }
        .links a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌌 NOVA Flow Diagrams Gallery</h1>
        <p>Exported high-resolution diagrams generated from <code>FLOW-NOVA.md</code>. Total: ${diagrams.length} diagrams.</p>
        ${diagrams
          .map(
            (d) => `
          <div class="card">
            <h2>${d.title}</h2>
            <div class="img-container">
              <img src="./${d.filename}.png" alt="${d.title}" />
            </div>
            <div class="links">
              <a href="./${d.filename}.png" target="_blank">📥 View PNG (High-Res)</a>
              <a href="./${d.filename}.svg" target="_blank">🔍 View SVG Vector</a>
            </div>
          </div>
        `
          )
          .join('\n')}
      </div>
    </body>
    </html>
  `
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), galleryHtml, 'utf8')
  console.log(`\n\x1b[32m✓ Gallery viewer ready: ${path.join(OUTPUT_DIR, 'index.html')}\x1b[0m`)

  await browser.close()

  console.log('\n\x1b[1m\x1b[36m=======================================================')
  console.log(`  COMPLETED: \x1b[32m${successCount}/${diagrams.length} Diagram(s) Exported successfully!\x1b[0m`)
  console.log('=======================================================\x1b[0m\n')
}

renderDiagrams().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err)
  process.exit(1)
})
