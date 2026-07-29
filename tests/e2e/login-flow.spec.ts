import { test, expect } from '@playwright/test'

/**
 * Login flow e2e test
 * Uses NEXT_PUBLIC_ADMIN_EMAIL from env + a test password
 * Run: npx playwright test tests/e2e/login-flow.spec.ts
 *
 * Set TEST_EMAIL and TEST_PASSWORD env vars before running:
 *   $env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"
 */

const TEST_EMAIL = process.env.TEST_EMAIL ?? ''
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? ''

test.describe('Login flow', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Set TEST_EMAIL and TEST_PASSWORD env vars to run login tests')

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Should land on dashboard, not loop back to login
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    expect(page.url()).toContain('/dashboard')
    expect(page.url()).not.toContain('/login')
  })

  test('after login, /booking is accessible without redirect', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Now visit /booking — should NOT redirect to login
    await page.goto('/booking')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).not.toContain('/login')
    expect(page.url()).toContain('/booking')
  })

  test('after login, /itinerary is accessible without redirect', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Now visit /itinerary — should NOT redirect to login
    await page.goto('/itinerary')
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).not.toContain('/login')
    expect(page.url()).toContain('/itinerary')
  })

  test('login with ?redirect param goes to correct page', async ({ page }) => {
    await page.goto('/login?redirect=/booking')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Should redirect to /booking, not /dashboard
    await page.waitForURL(/\/booking/, { timeout: 15000 })
    expect(page.url()).toContain('/booking')
  })

  test('wrong credentials shows error, does not redirect', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', 'wrongpassword123!')
    await page.click('button[type="submit"]')

    // Should stay on login with error message
    await page.waitForTimeout(3000)
    expect(page.url()).toContain('/login')
    const errorEl = page.locator('text=/incorrect|wrong|invalid/i')
    await expect(errorEl).toBeVisible({ timeout: 5000 })
  })
})
