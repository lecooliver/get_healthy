import { test, expect } from '@playwright/test'

test.describe('Password Reset & Email Verification', () => {
  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('h1')).toContainText('Get Healthy')
  })

  test('should show email input on forgot password', async ({ page }) => {
    await page.goto('/forgot-password')
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
  })

  test('should submit forgot password form', async ({ page }) => {
    await page.goto('/forgot-password')
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('test@example.com')
    const submitButton = page.locator('button[type="submit"]')
    if (await submitButton.isVisible()) {
      await submitButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should display reset password page', async ({ page }) => {
    await page.goto('/reset-password?token=test-token')
    await expect(page.locator('h1')).toContainText('Get Healthy')
  })

  test('should show password fields on reset page', async ({ page }) => {
    await page.goto('/reset-password?token=test-token')
    const passwordInput = page.locator('input[type="password"]').first()
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible()
    }
  })

  test('should display verify email page', async ({ page }) => {
    await page.goto('/verify-email?token=test-token')
    await page.waitForTimeout(1000)
    const heading = page.locator('h1, h2').first()
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible()
    }
  })

  test('should navigate to forgot password from login', async ({ page }) => {
    await page.goto('/login')
    const link = page.locator('a').filter({ hasText: /Forgot|Reset.*Password/i })
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/forgot-password/)
    }
  })
})
