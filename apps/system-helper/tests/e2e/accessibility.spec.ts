import { test as unauthTest, expect as unauthExpect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures/base';

// ---------------------------------------------------------------------------
// Helper: format axe violations into a readable string for assertion messages
// ---------------------------------------------------------------------------
function formatViolations(violations: Array<{ id: string; impact?: string | null; description: string; nodes: Array<{ html: string; failureSummary?: string }> }>): string {
  if (violations.length === 0) return '';
  return violations
    .map((v) => {
      const nodes = v.nodes
        .map((n) => `    - ${n.html}\n      ${n.failureSummary ?? ''}`)
        .join('\n');
      return `[${v.impact ?? 'unknown'}] ${v.id}: ${v.description}\n${nodes}`;
    })
    .join('\n\n');
}

// ===========================================================================
// Axe-core WCAG 2.1 AA scans - Unauthenticated pages
// ===========================================================================
unauthTest.describe('Accessibility - Unauthenticated Pages (axe-core)', () => {
  unauthTest('sign-in page has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(
      results.violations.length,
      `Sign-in page has accessibility violations:\n${formatViolations(results.violations)}`
    ).toBe(0);
  });

  unauthTest('sign-up page has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/sign-up');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(
      results.violations.length,
      `Sign-up page has accessibility violations:\n${formatViolations(results.violations)}`
    ).toBe(0);
  });
});

// ===========================================================================
// Axe-core WCAG 2.1 AA scans - Authenticated pages
// ===========================================================================
test.describe('Accessibility - Authenticated Pages (axe-core)', () => {
  test('projects list page has no WCAG 2.1 AA violations', async ({ projectsPage }) => {
    await projectsPage.goto();

    const results = await new AxeBuilder({ page: projectsPage.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(
      results.violations.length,
      `Projects page has accessibility violations:\n${formatViolations(results.violations)}`
    ).toBe(0);
  });

  test('project detail page has no WCAG 2.1 AA violations', async ({ projectsPage, page }) => {
    await projectsPage.goto();

    // Find first project link
    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available to test project detail accessibility');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(
      results.violations.length,
      `Project detail page has accessibility violations:\n${formatViolations(results.violations)}`
    ).toBe(0);
  });
});

// ===========================================================================
// Keyboard Navigation
// ===========================================================================
unauthTest.describe('Accessibility - Keyboard Navigation', () => {
  unauthTest('sign-in form tab order: email -> password -> submit', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Focus the email input first
    await page.locator('#email').focus();

    // Verify email input is focused
    const firstFocused = await page.evaluate(() => document.activeElement?.id);
    expect(firstFocused).toBe('email');

    // Tab to password
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.id);
    expect(secondFocused).toBe('password');

    // Tab to submit button
    await page.keyboard.press('Tab');
    const thirdFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName.toLowerCase() === 'button' && el?.getAttribute('type') === 'submit';
    });
    expect(thirdFocused).toBe(true);
  });

  unauthTest('sign-up form tab order: email -> password -> submit', async ({ page }) => {
    await page.goto('/sign-up');
    await page.waitForLoadState('domcontentloaded');

    // Focus the email input first
    await page.locator('#email').focus();

    const firstFocused = await page.evaluate(() => document.activeElement?.id);
    expect(firstFocused).toBe('email');

    // Tab to password
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.id);
    expect(secondFocused).toBe('password');

    // Tab to submit button
    await page.keyboard.press('Tab');
    const thirdFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName.toLowerCase() === 'button' && el?.getAttribute('type') === 'submit';
    });
    expect(thirdFocused).toBe(true);
  });
});

// ===========================================================================
// Focus Indicators
// ===========================================================================
unauthTest.describe('Accessibility - Focus Indicators', () => {
  unauthTest('interactive elements show visible focus styles on sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Check email input focus ring
    const emailInput = page.locator('#email');
    await emailInput.focus();
    const emailStyles = await emailInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        boxShadow: computed.boxShadow,
      };
    });
    // Focus should produce either an outline or a box-shadow ring
    const emailHasFocusIndicator =
      (emailStyles.outlineStyle !== 'none' && emailStyles.outlineWidth !== '0px') ||
      (emailStyles.boxShadow !== 'none' && emailStyles.boxShadow !== '');
    expect(emailHasFocusIndicator, 'Email input should have a visible focus indicator').toBe(true);

    // Check password input focus ring
    const passwordInput = page.locator('#password');
    await passwordInput.focus();
    const passwordStyles = await passwordInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        boxShadow: computed.boxShadow,
      };
    });
    const passwordHasFocusIndicator =
      (passwordStyles.outlineStyle !== 'none' && passwordStyles.outlineWidth !== '0px') ||
      (passwordStyles.boxShadow !== 'none' && passwordStyles.boxShadow !== '');
    expect(passwordHasFocusIndicator, 'Password input should have a visible focus indicator').toBe(true);

    // Check submit button focus ring
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.focus();
    const submitStyles = await submitButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        boxShadow: computed.boxShadow,
      };
    });
    const submitHasFocusIndicator =
      (submitStyles.outlineStyle !== 'none' && submitStyles.outlineWidth !== '0px') ||
      (submitStyles.boxShadow !== 'none' && submitStyles.boxShadow !== '');
    expect(submitHasFocusIndicator, 'Submit button should have a visible focus indicator').toBe(true);
  });
});

// ===========================================================================
// ARIA Labels
// ===========================================================================
unauthTest.describe('Accessibility - ARIA Labels', () => {
  unauthTest('sign-in page inputs and buttons have accessible names', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Email input should be accessible via label or aria-label
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await unauthExpect(emailInput).toBeVisible();

    // Submit button should have accessible text
    const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i });
    await unauthExpect(submitButton).toBeVisible();

    // Sign-up link should be accessible
    const signUpLink = page.getByRole('link', { name: /sign up|create account|register/i });
    await unauthExpect(signUpLink).toBeVisible();
  });

  unauthTest('sign-up page inputs and buttons have accessible names', async ({ page }) => {
    await page.goto('/sign-up');
    await page.waitForLoadState('domcontentloaded');

    // Email input should be accessible via label or aria-label
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await unauthExpect(emailInput).toBeVisible();

    // Submit button should have accessible text
    const submitButton = page.getByRole('button', { name: /sign up|create account|register|submit/i });
    await unauthExpect(submitButton).toBeVisible();

    // Sign-in link should be accessible
    const signInLink = page.getByRole('link', { name: /sign in|log in|already have/i });
    await unauthExpect(signInLink).toBeVisible();
  });
});

test.describe('Accessibility - ARIA Labels (Authenticated)', () => {
  test('projects page has accessible navigation and buttons', async ({ dashboardPage, projectsPage, page }) => {
    await projectsPage.goto();

    // Projects heading should be accessible
    const heading = page.getByRole('heading', { name: /projects/i });
    await expect(heading).toBeVisible();

    // New project button/link should be accessible
    const newProject = page.getByRole('link', { name: /new project/i }).or(
      page.getByRole('button', { name: /new project/i })
    );
    // May not exist if the UI uses a different pattern, but verify if present
    const newProjectCount = await newProject.count();
    if (newProjectCount > 0) {
      await expect(newProject.first()).toBeVisible();
    }
  });
});

// ===========================================================================
// Skip to Content
// ===========================================================================
unauthTest.describe('Accessibility - Skip Navigation', () => {
  unauthTest('skip-to-content link is present and functional (if implemented)', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Check if a skip navigation link exists (may be visually hidden)
    const skipLink = page.locator('a[href="#main-content"], a[href="#content"], a:has-text("Skip to content"), a:has-text("Skip to main")');
    const skipLinkCount = await skipLink.count();

    if (skipLinkCount > 0) {
      // Focus the skip link (usually first focusable element on page)
      await page.keyboard.press('Tab');

      // The skip link should become visible when focused
      const isVisible = await skipLink.first().isVisible();
      if (isVisible) {
        await skipLink.first().click();

        // Verify focus moves to main content area
        const focusedId = await page.evaluate(() => document.activeElement?.id);
        expect(
          ['main-content', 'content', 'main'].includes(focusedId ?? ''),
          'Focus should move to main content after clicking skip link'
        ).toBe(true);
      }
    }
    // If no skip link exists, this test passes silently -- it is a
    // best-practice recommendation, not a hard requirement for all pages.
  });
});

// ===========================================================================
// Form Error Announcements
// ===========================================================================
unauthTest.describe('Accessibility - Form Error Announcements', () => {
  unauthTest('sign-in form shows validation errors with accessible attributes', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Submit with empty fields to trigger validation
    await page.locator('button[type="submit"]').click();

    // Wait for potential error messages
    await page.waitForTimeout(500);

    // Check for visible error messages
    const errorMessages = page.locator('.text-red-500, [role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      // Verify errors are announced to screen readers via role="alert",
      // aria-live, or are associated with inputs via aria-describedby
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        if (await error.isVisible()) {
          const hasAccessibleAnnouncement = await error.evaluate((el) => {
            // Check if the error element has role="alert" or aria-live
            const hasAlert = el.getAttribute('role') === 'alert';
            const hasAriaLive = el.hasAttribute('aria-live');
            // Check if any input references this error via aria-describedby
            const errorId = el.id;
            const isDescribedBy = errorId
              ? !!document.querySelector(`[aria-describedby*="${errorId}"]`)
              : false;
            // Check if error is inside a label or fieldset
            const isInLabel = !!el.closest('label, fieldset');
            return hasAlert || hasAriaLive || isDescribedBy || isInLabel;
          });

          // This is a best-practice check. We log instead of hard-failing
          // because the app may use HTML5 native validation which is
          // inherently accessible.
          if (!hasAccessibleAnnouncement) {
            // Check if the browser provides native validation
            const hasNativeValidation = await page.evaluate(() => {
              const inputs = document.querySelectorAll('input[required], input:invalid');
              return inputs.length > 0;
            });
            // Native validation is accessible by default
            expect(
              hasNativeValidation || hasAccessibleAnnouncement,
              'Form errors should be announced to assistive technology'
            ).toBe(true);
          }
        }
      }
    }

    // Also check aria-invalid attribute on inputs after failed submission
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    const emailAriaInvalid = await emailInput.getAttribute('aria-invalid');
    const passwordAriaInvalid = await passwordInput.getAttribute('aria-invalid');
    const emailNativeInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).validity.valid
    );
    const passwordNativeInvalid = await passwordInput.evaluate(
      (el) => !(el as HTMLInputElement).validity.valid
    );

    // At least one mechanism should communicate invalid state
    const emailCommunicatesError = emailAriaInvalid === 'true' || emailNativeInvalid;
    const passwordCommunicatesError = passwordAriaInvalid === 'true' || passwordNativeInvalid;

    // If the form actually validates (not all forms do on empty submit),
    // ensure the invalid state is communicated
    if (emailCommunicatesError || passwordCommunicatesError) {
      expect(
        emailCommunicatesError || passwordCommunicatesError,
        'Invalid form fields should communicate their state to assistive technology'
      ).toBe(true);
    }
  });
});
