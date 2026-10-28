import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show 404 redirect to dashboard', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
