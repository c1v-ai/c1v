import { test, expect } from './fixtures/base';

/**
 * Smoke tests to validate the test infrastructure works.
 * These use the custom fixtures (page objects) and authenticated state.
 */

test.describe('Infrastructure Smoke Tests', () => {
  test('authenticated user can access projects page', async ({ projectsPage }) => {
    await projectsPage.goto();
    await expect(projectsPage.heading).toBeVisible();
  });

  test('dashboard header renders with navigation', async ({ dashboardPage, page }) => {
    await page.goto('/projects');
    await expect(dashboardPage.logo).toBeVisible();
  });

  test('page objects are properly typed', async ({ signInPage }) => {
    // Verify the unauthenticated page object works
    await signInPage.goto();
    await expect(signInPage.emailInput).toBeVisible();
    await expect(signInPage.passwordInput).toBeVisible();
    await expect(signInPage.submitButton).toBeVisible();
  });
});
