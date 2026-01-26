import { test as unauthTest } from '@playwright/test';
import { test, expect } from './fixtures/base';
import { VIEWPORTS } from './helpers/test-data';

// ---------------------------------------------------------------------------
// Viewport presets for visual regression captures
// ---------------------------------------------------------------------------
const SCREENSHOT_VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

const SCREENSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.01,
  fullPage: true,
} as const;

// ===========================================================================
// Screenshot Baselines - Unauthenticated (sign-in)
// ===========================================================================
unauthTest.describe('Visual Regression - Sign-in Page', () => {
  for (const [name, viewport] of Object.entries(SCREENSHOT_VIEWPORTS)) {
    unauthTest(`sign-in page matches baseline at ${name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/sign-in');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`sign-in-${name}.png`, SCREENSHOT_OPTIONS);
    });
  }
});

// ===========================================================================
// Screenshot Baselines - Authenticated (projects list)
// ===========================================================================
test.describe('Visual Regression - Projects Page', () => {
  for (const [name, viewport] of Object.entries(SCREENSHOT_VIEWPORTS)) {
    test(`projects page matches baseline at ${name} (${viewport.width}x${viewport.height})`, async ({ projectsPage, page }) => {
      await page.setViewportSize(viewport);
      await projectsPage.goto();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`projects-${name}.png`, SCREENSHOT_OPTIONS);
    });
  }
});

// ===========================================================================
// Screenshot Baselines - Project Detail
// ===========================================================================
test.describe('Visual Regression - Project Detail Page', () => {
  for (const [name, viewport] of Object.entries(SCREENSHOT_VIEWPORTS)) {
    test(`project detail matches baseline at ${name} (${viewport.width}x${viewport.height})`, async ({ projectsPage, page }) => {
      // Navigate to first available project
      await projectsPage.goto();
      const projectLinks = page.locator('a[href^="/projects/"]').filter({
        has: page.locator('h3'),
      });
      const count = await projectLinks.count();
      test.skip(count === 0, 'No projects available for visual regression');

      await projectLinks.first().click();
      await page.waitForLoadState('domcontentloaded');

      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      // Allow layout to settle after viewport change
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot(`project-detail-${name}.png`, SCREENSHOT_OPTIONS);
    });
  }
});

// ===========================================================================
// Dark Mode Parity
// ===========================================================================
test.describe('Visual Regression - Dark Mode', () => {
  test('projects page in light mode matches baseline', async ({ projectsPage, dashboardPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();
    await page.waitForLoadState('networkidle');

    // Ensure we are in light mode
    const isDark = await dashboardPage.isDarkMode();
    if (isDark) {
      await dashboardPage.toggleTheme();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('projects-light-mode.png', SCREENSHOT_OPTIONS);
  });

  test('projects page in dark mode matches baseline', async ({ projectsPage, dashboardPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();
    await page.waitForLoadState('networkidle');

    // Ensure we are in dark mode
    const isDark = await dashboardPage.isDarkMode();
    if (!isDark) {
      await dashboardPage.toggleTheme();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('projects-dark-mode.png', SCREENSHOT_OPTIONS);
  });

  test('project detail in light mode matches baseline', async ({ projectsPage, dashboardPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();

    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available for dark mode comparison');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // Ensure light mode
    const isDark = await dashboardPage.isDarkMode();
    if (isDark) {
      await dashboardPage.toggleTheme();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('project-detail-light-mode.png', SCREENSHOT_OPTIONS);
  });

  test('project detail in dark mode matches baseline', async ({ projectsPage, dashboardPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();

    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available for dark mode comparison');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // Ensure dark mode
    const isDark = await dashboardPage.isDarkMode();
    if (!isDark) {
      await dashboardPage.toggleTheme();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveScreenshot('project-detail-dark-mode.png', SCREENSHOT_OPTIONS);
  });
});

// ===========================================================================
// prefers-reduced-motion
// ===========================================================================
test.describe('Visual Regression - Reduced Motion', () => {
  test('projects page renders correctly with prefers-reduced-motion', async ({ projectsPage, page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('projects-reduced-motion.png', SCREENSHOT_OPTIONS);
  });

  test('project detail renders correctly with prefers-reduced-motion', async ({ projectsPage, page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();

    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available for reduced motion test');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('project-detail-reduced-motion.png', SCREENSHOT_OPTIONS);
  });
});

// ===========================================================================
// Responsive Layout - 3-Column Project Detail
// ===========================================================================
test.describe('Visual Regression - Responsive Layout', () => {
  test('project detail 3-column layout at desktop (1280px)', async ({ projectsPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.desktop);
    await projectsPage.goto();

    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available for responsive layout test');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // At desktop, all 3 columns (explorer + main + chat) should be visible
    const explorer = page.locator('aside').filter({ has: page.getByText('Completeness') });
    const chatPanel = page.locator('aside').filter({ has: page.getByText('Chat') });
    const mainContent = page.locator('main');

    await expect(explorer).toBeVisible();
    await expect(mainContent).toBeVisible();
    await expect(chatPanel).toBeVisible();

    await expect(page).toHaveScreenshot('layout-desktop-3col.png', SCREENSHOT_OPTIONS);
  });

  test('project detail collapsed layout at tablet (768px)', async ({ projectsPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.tablet);
    await projectsPage.goto();

    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available for responsive layout test');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    // Allow layout to settle after viewport change
    await page.waitForTimeout(300);

    // At tablet (768px): explorer hidden, chat visible, main visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    await expect(page).toHaveScreenshot('layout-tablet-collapsed.png', SCREENSHOT_OPTIONS);
  });

  test('project detail mobile layout (375px)', async ({ projectsPage, page }) => {
    await page.setViewportSize(SCREENSHOT_VIEWPORTS.mobile);
    await projectsPage.goto();

    const projectLinks = page.locator('a[href^="/projects/"]').filter({
      has: page.locator('h3'),
    });
    const count = await projectLinks.count();
    test.skip(count === 0, 'No projects available for responsive layout test');

    await projectLinks.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    // Allow layout to settle after viewport change
    await page.waitForTimeout(300);

    // At mobile: only main content, FABs for explorer and chat
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    await expect(page).toHaveScreenshot('layout-mobile.png', SCREENSHOT_OPTIONS);
  });
});
