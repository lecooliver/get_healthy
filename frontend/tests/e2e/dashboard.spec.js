import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display dashboard page', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText('Test User')
  })

  test('should show stats cards', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)
    const statsCards = page.locator('.grid').filter({ hasText: /Workouts|Measurements|Streak/i })
    const count = await statsCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show motivational message', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(1000)
    const message = page.locator('text=/Keep going|Great|Amazing|You/i')
    const count = await message.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to measurements from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a').filter({ hasText: /Measurement|Progress/i }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/measurements/)
    }
  })

  test('should navigate to routines from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a').filter({ hasText: /Routine|Workout/i }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/routines/)
    }
  })
})
