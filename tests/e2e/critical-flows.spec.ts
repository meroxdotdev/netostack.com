import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check that navigation is present
    await expect(page.locator('nav')).toBeVisible();

    // Check that main tools are accessible
    await expect(page.locator('[href*="subnet"]')).toBeVisible();
    await expect(page.locator('[href*="cidr"]')).toBeVisible();
  });

  test('subnet calculator is accessible', async ({ page }) => {
    await page.goto('/tools/subnet-calculator');

    // Check that the page loads
    await expect(page.getByRole('heading')).toBeVisible();

    // Check for input fields
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('CIDR calculator is accessible', async ({ page }) => {
    await page.goto('/tools/cidr-calculator');

    // Check that the page loads
    await expect(page.getByRole('heading')).toBeVisible();

    // Check for calculation interface
    await expect(page.locator('input, textarea')).toBeVisible();
  });

  test('navigation between tools works', async ({ page }) => {
    await page.goto('/');

    // Navigate to subnet calculator
    await page.click('[href*="subnet"]');
    await expect(page).toHaveURL(/subnet/);

    // Navigate back to home
    await page.click('[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('reference section is accessible', async ({ page }) => {
    await page.goto('/reference');

    // Check that reference content loads
    await expect(page.getByRole('heading')).toBeVisible();

    // Check for reference links or content
    await expect(page.locator('a, [role="link"]')).toBeVisible();
  });
});