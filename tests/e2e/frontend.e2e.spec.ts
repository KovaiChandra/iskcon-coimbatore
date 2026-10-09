import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('home page renders the hero and donate button', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/ISKCON Coimbatore/)
    await expect(page.locator('h1').first()).toContainText('Jagannath')
    await expect(page.getByRole('link', { name: 'DONATE' })).toBeVisible()
  })
})
