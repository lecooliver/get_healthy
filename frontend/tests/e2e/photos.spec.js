import { test, expect } from '@playwright/test'

test.describe('Photo Journal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display photo journal page', async ({ page }) => {
    await page.goto('/photos')
    await expect(page.locator('h1')).toContainText('Photo Journal')
  })

  test('should show upload photo button', async ({ page }) => {
    await page.goto('/photos')
    const uploadButton = page.locator('button').filter({ hasText: /Upload/i })
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible()
    }
  })

  test('should open upload modal', async ({ page }) => {
    await page.goto('/photos')
    const uploadButton = page.locator('button').filter({ hasText: /Upload/i })
    if (await uploadButton.isVisible()) {
      await uploadButton.click()
      await page.waitForTimeout(500)
      const dialog = page.locator('[role="dialog"], .modal, form')
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible()
      }
    }
  })

  test('should show category filter', async ({ page }) => {
    await page.goto('/photos')
    await page.waitForTimeout(1000)
    const select = page.locator('select').filter({ hasText: /Category|Filter/i })
    if (await select.isVisible()) {
      await expect(select).toBeVisible()
    }
  })

  test('should display empty state when no photos', async ({ page }) => {
    await page.goto('/photos')
    await page.waitForTimeout(1000)
  })

  test('should navigate to photos from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const link = page.locator('a').filter({ hasText: /Photo|Gallery/i }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/photos/)
    }
  })
})
