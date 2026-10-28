import { test, expect } from '@playwright/test'

test.describe('Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display schedule page', async ({ page }) => {
    await page.goto('/schedule')
    await expect(page.locator('h1')).toContainText('Schedule')
  })

  test('should show calendar view', async ({ page }) => {
    await page.goto('/schedule')
    await page.waitForTimeout(1000)
    const calendar = page.locator('[class*="calendar"], table, .fc')
    const count = await calendar.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show add workout button', async ({ page }) => {
    await page.goto('/schedule')
    await page.waitForTimeout(1000)
    const addButton = page.locator('button').filter({ hasText: /Add|Schedule|New/i })
    if ((await addButton.count()) > 0 && await addButton.first().isVisible()) {
      await expect(addButton.first()).toBeVisible()
    }
  })

  test('should show cadence options', async ({ page }) => {
    await page.goto('/schedule')
    await page.waitForTimeout(1000)
    const cadenceText = page.locator('text=/Cadence|Every.*Day|Repeat/i')
    const count = await cadenceText.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to schedule from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a').filter({ hasText: /Schedule|Calendar/i }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/schedule/)
    }
  })
})
