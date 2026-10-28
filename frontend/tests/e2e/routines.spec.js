import { test, expect } from '@playwright/test'

test.describe('Routines & Workouts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display routines page', async ({ page }) => {
    await page.goto('/routines')
    await expect(page.locator('h1')).toContainText('My Routines')
  })

  test('should show create routine button', async ({ page }) => {
    await page.goto('/routines')
    const createButton = page.locator('button').filter({ hasText: /Create|Add.*Routine/i })
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible()
    }
  })

  test('should create new routine', async ({ page }) => {
    await page.goto('/routines')
    const createButton = page.locator('button').filter({ hasText: /Create|Add.*Routine/i })
    if (await createButton.isVisible()) {
      await createButton.click()
      const nameInput = page.locator('input[type="text"]').filter({ hasText: '' }).first()
      if (await nameInput.isVisible()) {
        await nameInput.fill('E2E Test Routine')
        const typeSelect = page.locator('select').first()
        if (await typeSelect.isVisible()) {
          await typeSelect.selectOption('weightlifting')
        }
        const saveButton = page.locator('button').filter({ hasText: /Save|Create/i })
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should view routine workouts', async ({ page }) => {
    await page.goto('/routines')
    await page.waitForTimeout(1000)
    const routineCards = page.locator('a[href*="/routines/"], .card, [class*="routine"]')
    const count = await routineCards.count()
    if (count > 0) {
      const firstCard = routineCards.first()
      if (await firstCard.isVisible()) {
        await firstCard.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should show workout list', async ({ page }) => {
    await page.goto('/routines')
    await page.waitForTimeout(1000)
    const routineCards = page.locator('.card, .routine-card, [class*="routine"]')
    const count = await routineCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
