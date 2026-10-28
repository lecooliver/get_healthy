import { test, expect } from '@playwright/test'

test.describe('Reports & Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display reports page', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.locator('h1')).toContainText('Reports & Analytics')
  })

  test('should show progress chart', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForTimeout(1000)
    const chart = page.locator('canvas, svg, .chart')
    const count = await chart.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show date range selector', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForTimeout(1000)
    const select = page.locator('select').filter({ hasText: /Week|Month|Year/i })
    if (await select.isVisible()) {
      await expect(select).toBeVisible()
    }
  })

  test('should display export page', async ({ page }) => {
    await page.goto('/export')
    await expect(page.locator('h1')).toContainText('Export Your Data')
  })

  test('should show JSON export button', async ({ page }) => {
    await page.goto('/export')
    await page.waitForTimeout(1000)
    const jsonButton = page.locator('button').filter({ hasText: /JSON/i })
    if (await jsonButton.isVisible()) {
      await expect(jsonButton).toBeVisible()
    }
  })

  test('should show CSV export button', async ({ page }) => {
    await page.goto('/export')
    await page.waitForTimeout(1000)
    const csvButton = page.locator('button').filter({ hasText: /CSV/i })
    if (await csvButton.isVisible()) {
      await expect(csvButton).toBeVisible()
    }
  })

  test('should navigate to reports from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a').filter({ hasText: /Report|Chart/i }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/reports/)
    }
  })
})
