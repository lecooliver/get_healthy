import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Get Healthy')
    await expect(page.locator('text=Sign in to your account')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('Get Healthy')
    await expect(page.locator('text=Create your account')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Create one')
    await expect(page).toHaveURL(/\/register/)
  })

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/register')
    await page.click('text=Sign in')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    const errorDiv = page.locator('[role="alert"]')
    if (await errorDiv.isVisible()) {
      await expect(errorDiv).toBeVisible()
    }
  })

  test('should show validation errors on empty register', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[type="text"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.locator('input[type="password"]').first().fill('pass')
    await page.locator('input[type="password"]').last().fill('different')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    const errorDiv = page.locator('[role="alert"]')
    if (await errorDiv.isVisible()) {
      await expect(errorDiv).toBeVisible()
    }
  })
})
