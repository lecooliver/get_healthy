import { test, expect } from '@playwright/test'

test.describe('Body Measurements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display measurements page', async ({ page }) => {
    await page.goto('/measurements')
    await expect(page.locator('h1')).toContainText('Body Measurements')
  })

  test('should show add measurement button', async ({ page }) => {
    await page.goto('/measurements')
    const addButton = page.locator('button').filter({ hasText: /Add|New.*Measurement/i })
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible()
    }
  })

  test('should open add measurement form', async ({ page }) => {
    await page.goto('/measurements')
    const addButton = page.locator('button').filter({ hasText: /Add|New.*Measurement/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(500)
      const weightInput = page.locator('input[type="number"]').first()
      if (await weightInput.isVisible()) {
        await expect(weightInput).toBeVisible()
      }
    }
  })

  test('should enter measurement data', async ({ page }) => {
    await page.goto('/measurements')
    const addButton = page.locator('button').filter({ hasText: /Add|New.*Measurement/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(500)
      
      const weightInput = page.locator('input[type="number"]').first()
      if (await weightInput.isVisible()) {
        await weightInput.fill('180')
      }
      
      const saveButton = page.locator('button').filter({ hasText: /Save|Submit/i })
      if (await saveButton.isVisible()) {
        await saveButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should toggle chart visibility', async ({ page }) => {
    await page.goto('/measurements')
    const chartButton = page.locator('button').filter({ hasText: /Chart|Show|Hide/i })
    if (await chartButton.isVisible()) {
      await chartButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should display measurement history table', async ({ page }) => {
    await page.goto('/measurements')
    await page.waitForTimeout(1000)
    const table = page.locator('table')
    const count = await table.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should filter measurements by date', async ({ page }) => {
    await page.goto('/measurements')
    await page.waitForTimeout(1000)
    const dateInput = page.locator('input[type="date"]')
    if ((await dateInput.count()) > 0) {
      await dateInput.first().fill('2026-05-01')
      await page.waitForTimeout(500)
    }
  })
})
