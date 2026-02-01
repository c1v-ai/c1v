import { test, expect } from '@playwright/test';
import { SignInPage } from './pages/sign-in.page';
import { SignUpPage } from './pages/sign-up.page';
import { TEST_USER } from './helpers/test-data';

/**
 * Authentication E2E tests.
 *
 * These run under the "unauthenticated" Playwright project
 * (no stored auth state) so every test starts from a clean session.
 * We import directly from @playwright/test rather than from
 * fixtures/base to avoid inheriting stored auth state.
 */

test.describe('Sign-in page', () => {
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    await signInPage.goto();
  });

  test('renders all expected elements', async () => {
    await expect(signInPage.emailInput).toBeVisible();
    await expect(signInPage.passwordInput).toBeVisible();
    await expect(signInPage.submitButton).toBeVisible();
    await expect(signInPage.forgotPasswordLink).toBeVisible();
    await expect(signInPage.signUpLink).toBeVisible();
  });

  test('shows validation when submitting empty fields', async () => {
    await signInPage.submitButton.click();

    // The browser's built-in validation or app validation should prevent
    // submission. Check that we remain on the sign-in page and either
    // a native validation message or an app error is shown.
    await expect(signInPage.page).toHaveURL(/sign-in/);

    // At least one of the inputs should report a validation issue.
    // HTML5 required fields surface a validationMessage on the element.
    const emailValid = await signInPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    const passwordValid = await signInPage.passwordInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    const hasAppError = await signInPage.errorMessage.isVisible();

    expect(emailValid === false || passwordValid === false || hasAppError).toBe(true);
  });

  test('shows error message for invalid credentials', async ({ page }) => {
    await signInPage.signIn('wrong@example.com', 'WrongPassword999!');

    // Wait for the error message to appear after the server responds
    await expect(signInPage.errorMessage).toBeVisible({ timeout: 15000 });

    const errorText = await signInPage.getError();
    expect(errorText).toBeTruthy();
    expect(errorText!.length).toBeGreaterThan(0);
  });

  test('redirects to projects page on valid sign-in', async ({ page }) => {
    await signInPage.signInAndWait(TEST_USER.email, TEST_USER.password);

    await expect(page).toHaveURL(/\/projects/);
  });

  test('forgot password link is visible and points to correct URL', async () => {
    await expect(signInPage.forgotPasswordLink).toBeVisible();
    await expect(signInPage.forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  test('sign-up link navigates to sign-up page', async ({ page }) => {
    // Wait for hydration before clicking Next.js Link
    await page.waitForLoadState('networkidle');

    // Use Promise.all to simultaneously click and wait for navigation
    await Promise.all([
      page.waitForURL(/\/sign-up/, { timeout: 15000 }),
      page.getByRole('link', { name: 'Create an account' }).click(),
    ]);

    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe('Sign-up page', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.goto();
  });

  test('renders all expected elements', async () => {
    await expect(signUpPage.emailInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await expect(signUpPage.submitButton).toBeVisible();
    await expect(signUpPage.signInLink).toBeVisible();
  });

  test('sign-in link navigates to sign-in page', async ({ page }) => {
    // Wait for hydration before clicking Next.js Link
    await page.waitForLoadState('networkidle');
    await signUpPage.signInLink.click();

    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });
});

test.describe('Protected routes', () => {
  test('redirect unauthenticated users to sign-in', async ({ page }) => {
    // Attempt to visit a protected route without any auth state
    await page.goto('/projects');

    // Should be redirected to the sign-in page
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });
});

test.describe('Session persistence', () => {
  test('session survives page refresh', async ({ page }) => {
    // Sign in first
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signInAndWait(TEST_USER.email, TEST_USER.password);

    // Confirm we are on the projects page
    await expect(page).toHaveURL(/\/projects/);

    // Refresh the page — use commit since the projects page may have
    // server errors that prevent full load
    await page.reload({ waitUntil: 'commit' });

    // Should still be on an authenticated page, not redirected to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/projects/);
  });
});
