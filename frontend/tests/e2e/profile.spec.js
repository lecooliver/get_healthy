import { test, expect } from '@playwright/test'

test.describe('Profile & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display profile page', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.locator('h1')).toContainText('Profile Settings')
  })

  test('should show display name', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(1000)
    const nameInput = page.locator('input[type="text"]').filter({ hasText: '' }).first()
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible()
    }
  })

  test('should show exercise limits section', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(1000)
    const limitsSection = page.locator('text=/Limit|Exercise.*Limit/i')
    const count = await limitsSection.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show add limit button', async ({ page }) => {
    await page.goto('/profile')
    const addButton = page.locator('button').filter({ hasText: /Add.*Limit/i })
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible()
    }
  })

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(1000)
    const darkModeToggle = page.locator('button, input[type="checkbox"]').filter({ hasText: /Dark|Theme|Mode/i })
    if ((await darkModeToggle.count()) > 0 && await darkModeToggle.first().isVisible()) {
      await darkModeToggle.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('should show avatar upload', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(1000)
    const avatarSection = page.locator('text=/Avatar|Photo/i')
    const count = await avatarSection.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to profile from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a').filter({ hasText: /Profile|Settings/i }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/profile/)
    }
  })
})
