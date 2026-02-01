import { test as base, expect } from '@playwright/test';
import {
  SignInPage,
  SignUpPage,
  ProjectsPage,
  ProjectDetailPage,
  ChatPanelPage,
  DashboardPage,
} from '../pages';

/**
 * Extended Playwright test fixtures that provide page objects
 * and authenticated state for E2E tests.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/base';
 *
 *   test('can list projects', async ({ projectsPage }) => {
 *     await projectsPage.goto();
 *     // ...
 *   });
 *
 *   test('authenticated test', async ({ authedPage }) => {
 *     // Already logged in, storage state loaded
 *     await authedPage.goto('/projects');
 *   });
 */

// Path to the stored authentication state (created by auth.setup.ts)
const AUTH_STATE_PATH = 'tests/e2e/.auth/user.json';

// ----- Custom fixtures -----

type Fixtures = {
  // Page objects (unauthenticated - for testing auth flows)
  signInPage: SignInPage;
  signUpPage: SignUpPage;

  // Page objects (authenticated - use stored auth state)
  dashboardPage: DashboardPage;
  projectsPage: ProjectsPage;
  projectDetailPage: ProjectDetailPage;
  chatPanelPage: ChatPanelPage;
};

export const test = base.extend<Fixtures>({
  // --- Unauthenticated page objects ---
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },

  // --- Authenticated page objects ---
  // These rely on the 'authenticated' project in playwright.config.ts
  // which loads stored auth state before each test.

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },

  projectDetailPage: async ({ page }, use) => {
    await use(new ProjectDetailPage(page));
  },

  chatPanelPage: async ({ page }, use) => {
    await use(new ChatPanelPage(page));
  },
});

export { expect };
export { AUTH_STATE_PATH };
