import { test as setup, expect } from '@playwright/test';
import { TEST_USER } from './helpers/test-data';
import { AUTH_STATE_PATH } from './fixtures/base';

/**
 * Global auth setup — runs once before all authenticated test suites.
 * Signs in with test credentials and saves browser storage state
 * so subsequent tests skip the login flow entirely.
 *
 * Prerequisites:
 * - A test user must exist in the database (seeded or created manually).
 * - Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars, or use defaults.
 */
setup('authenticate', async ({ page }) => {
  // Navigate to sign-in
  await page.goto('/sign-in');
  await page.waitForLoadState('domcontentloaded');

  // Fill in credentials
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to authenticated area. Use 'commit' since the
  // projects page may have server-side errors that prevent full load —
  // we only need the URL to change to confirm auth succeeded.
  await page.waitForURL('**/projects**', {
    timeout: 60000,
    waitUntil: 'commit',
  });

  // Save storage state (cookies + localStorage) for reuse
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
