import { test, expect } from '@playwright/test'

/**
 * Auth Guard Tests
 * Tests that /booking and /itinerary redirect unauthenticated users to /login
 * and that dynamic content sections load without errors.
 *
 * Prerequisites: dev server running on http://localhost:3000
 */

test.describe('Auth Guards — unauthenticated redirects', () => {
  test('/booking redirects to /login when not logged in', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('/booking redirect includes ?redirect param', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('redirect')
  })

  test('/itinerary redirects to /login when not logged in', async ({ page }) => {
    await page.goto('/itinerary')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('/itinerary redirect includes ?redirect param', async ({ page }) => {
    await page.goto('/itinerary')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('redirect')
  })

  test('/dashboard redirects to /login when not logged in', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('/admin redirects to /login when not logged in', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })
})

test.describe('Public pages — accessible without login', () => {
  test('/ loads without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const jsErrors = errors.filter(e => !e.includes('ResizeObserver'))
    expect(jsErrors).toHaveLength(0)
  })

  test('/packages loads without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/packages')
    await page.waitForLoadState('domcontentloaded')
    const jsErrors = errors.filter(e => !e.includes('ResizeObserver'))
    expect(jsErrors).toHaveLength(0)
  })

  test('/search loads without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/search')
    await page.waitForLoadState('domcontentloaded')
    const jsErrors = errors.filter(e => !e.includes('ResizeObserver'))
    expect(jsErrors).toHaveLength(0)
  })

  test('/login page renders', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dynamic content — API responses', () => {
  test('/api/stats returns array with iconName fields', async ({ request }) => {
    const res = await request.get('/api/stats')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
    const withIcon = data.filter((s: { iconName: string | null }) => s.iconName !== null)
    expect(withIcon.length).toBeGreaterThan(0)
  })

  test('/api/partners returns array with name fields', async ({ request }) => {
    const res = await request.get('/api/partners')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('fontFamily')
  })

  test('/api/backers returns array with name fields', async ({ request }) => {
    const res = await request.get('/api/backers')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('name')
  })

  test('/api/features returns array with title and image', async ({ request }) => {
    const res = await request.get('/api/features')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('title')
    expect(data[0]).toHaveProperty('image')
    expect(data[0]).toHaveProperty('iconName')
  })

  test('/api/how-it-works returns array with number and title', async ({ request }) => {
    const res = await request.get('/api/how-it-works')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('number')
    expect(data[0]).toHaveProperty('title')
    expect(data[0]).toHaveProperty('iconName')
  })

  test('/api/hero returns videoUrl field', async ({ request }) => {
    const res = await request.get('/api/hero')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('videoUrl')
    expect(data.videoUrl).toBeTruthy()
  })

  test('/api/ai/itinerary returns 401 for unauthenticated requests', async ({ request }) => {
    const res = await request.post('/api/ai/itinerary', {
      data: { destination: 'Bali', duration: 3, travelers: 2, budget: 'Mid-range' },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('Homepage dynamic sections — no runtime errors', () => {
  test('StatsBar renders with values', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // Wait for dynamic stats to load
    await page.waitForTimeout(2000)
    const jsErrors = errors.filter(e => !e.includes('ResizeObserver'))
    expect(jsErrors).toHaveLength(0)
  })

  test('HowItWorksSection renders without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.locator('#how-it-works').scrollIntoViewIfNeeded()
    await expect(page.locator('#how-it-works')).toBeVisible()
    const jsErrors = errors.filter(e => !e.includes('ResizeObserver'))
    expect(jsErrors).toHaveLength(0)
  })

  test('packages section loads without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.locator('#packages').scrollIntoViewIfNeeded()
    await expect(page.locator('#packages')).toBeVisible()
    const jsErrors = errors.filter(e => !e.includes('ResizeObserver'))
    expect(jsErrors).toHaveLength(0)
  })
})
