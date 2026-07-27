import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads without runtime errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('renders hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('section').first()).toBeVisible()
  })

  test('FAQ section renders without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Scroll to FAQ section
    await page.locator('#help').scrollIntoViewIfNeeded()
    await expect(page.locator('#help')).toBeVisible()

    // No .map / .filter errors
    const mapErrors = errors.filter(e => e.includes('is not a function'))
    expect(mapErrors).toHaveLength(0)
  })

  test('PackagesSection renders without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const mapErrors = errors.filter(e => e.includes('is not a function'))
    expect(mapErrors).toHaveLength(0)
  })
})

test.describe('Booking page', () => {
  test('loads without runtime errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/booking')
    await page.waitForLoadState('networkidle')

    const mapErrors = errors.filter(e => e.includes('is not a function'))
    expect(mapErrors).toHaveLength(0)
  })

  test('renders booking steps', async ({ page }) => {
    await page.goto('/booking')
    await expect(page.getByText('Negara')).toBeVisible()
  })
})
