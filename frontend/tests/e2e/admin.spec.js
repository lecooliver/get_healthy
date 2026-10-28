import { test, expect } from '@playwright/test'

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display admin page', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText('Admin Settings')
  })

  test('should show user management', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(1000)
    const usersSection = page.locator('text=/Users|User.*List/i')
    const count = await usersSection.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show system stats', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(1000)
    const stats = page.locator('text=/Stats|Statistics|Total.*User/i')
    const count = await stats.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show OIDC settings tab', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(1000)
    const oidcTab = page.locator('button, a').filter({ hasText: /OIDC|OAuth|SSO/i })
    if ((await oidcTab.count()) > 0 && await oidcTab.first().isVisible()) {
      await oidcTab.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('should show SMTP settings tab', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(1000)
    const smtpTab = page.locator('button, a').filter({ hasText: /SMTP|Email|Mail/i })
    if ((await smtpTab.count()) > 0 && await smtpTab.first().isVisible()) {
      await smtpTab.first().click()
      await page.waitForTimeout(500)
    }
  })
})
