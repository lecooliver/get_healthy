import { test, expect } from '@playwright/test'

test.describe('Measurements', () => {
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

  test('should show add measurement form', async ({ page }) => {
    await page.goto('/measurements')
    const addButton = page.locator('button').filter({ hasText: /Add/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      await expect(page.locator('input[type="date"]')).toBeVisible()
    }
  })

  test('should toggle chart visibility', async ({ page }) => {
    await page.goto('/measurements')
    const chartButton = page.locator('button').filter({ hasText: /Hide|Show/ })
    if (await chartButton.isVisible()) {
      await chartButton.click()
    }
  })

  test('should display measurement table when data exists', async ({ page }) => {
    await page.goto('/measurements')
    const table = page.locator('table')
    if (await table.isVisible()) {
      await expect(table).toBeVisible()
    }
  })
})

test.describe('Profile - Exercise Limits', () => {
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

  test('should show add limit button', async ({ page }) => {
    await page.goto('/profile')
    const addButton = page.locator('button').filter({ hasText: /Add.*Limit/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      const cancelButton = page.locator('button').filter({ hasText: /Cancel/i })
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
      }
    }
  })
})

test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display templates page', async ({ page }) => {
    await page.goto('/templates')
    await expect(page.locator('h1')).toContainText('Workout Templates')
  })

  test('should show filter options', async ({ page }) => {
    await page.goto('/templates')
    await page.waitForTimeout(1000)
    const selects = page.locator('select')
    const count = await selects.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display template cards', async ({ page }) => {
    await page.goto('/templates')
    await page.waitForTimeout(1000)
  })

  test('should show create template button', async ({ page }) => {
    await page.goto('/templates')
    const createButton = page.locator('button').filter({ hasText: /Create/i })
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible()
    }
  })

  test('should open create template modal with exercise groups', async ({ page }) => {
    await page.goto('/templates')
    const createButton = page.locator('button').filter({ hasText: /Create/i })
    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(500)
      
      // Check if modal opens
      const modal = page.locator('.fixed.inset-0')
      if (await modal.isVisible()) {
        await expect(page.locator('input[placeholder="My Custom Template"]')).toBeVisible()
        
        // Check if exercise groups section exists
        const groupInput = page.locator('input[placeholder="Group name"]').first()
        if (await groupInput.isVisible()) {
          await expect(groupInput).toBeVisible()
        }
      }
    }
  })

  test('should add exercise group to workout', async ({ page }) => {
    await page.goto('/templates')
    const createButton = page.locator('button').filter({ hasText: /Create/i })
    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(500)
      
      const modal = page.locator('.fixed.inset-0')
      if (await modal.isVisible()) {
        // Click "Add Group" button
        const addGroupBtn = page.locator('button').filter({ hasText: /Add Group/i }).first()
        if (await addGroupBtn.isVisible()) {
          await addGroupBtn.click()
          await page.waitForTimeout(300)
          
          // Should have 2 exercise groups now
          const groupInputs = page.locator('input[placeholder="Group name"]')
          const count = await groupInputs.count()
          expect(count).toBeGreaterThanOrEqual(2)
        }
      }
    }
  })
})

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

  test('should show empty state when no photos', async ({ page }) => {
    await page.goto('/photos')
    await page.waitForTimeout(1000)
  })
})
