import { expect, test } from '@playwright/test'

// The API is mocked so this runs without a backend. Real end-to-end tests arrive in P1-22.
test('home page shows the app title and health', async ({ page }) => {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { status: 'ok', database: 'ok' } }),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Brightcone People' })).toBeVisible()
  await expect(page.getByTestId('health')).toContainText('ok')
})
