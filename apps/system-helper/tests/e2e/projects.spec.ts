import { test, expect } from './fixtures/base';
import { VIEWPORTS } from './helpers/test-data';

/**
 * E2E tests for the project management flow.
 *
 * Covers:
 *  - Projects list page (heading, empty state, project cards)
 *  - Dashboard navigation elements
 *  - New project entry point
 *  - Project detail page (3-column layout, explorer sidebar, chat panel)
 *  - In-project navigation between sections
 */

test.describe('Projects List Page', () => {
  test('renders with the projects heading', async ({ projectsPage }) => {
    await projectsPage.goto();

    await expect(projectsPage.heading).toBeVisible();
  });

  test('shows correct dashboard navigation elements', async ({
    dashboardPage,
    page,
  }) => {
    await page.goto('/projects');

    await expect(dashboardPage.logo).toBeVisible();
    await expect(dashboardPage.desktopNav).toBeVisible();
    await expect(dashboardPage.projectsLink).toBeVisible();
  });

  test('"New Project" button is visible and clickable', async ({
    projectsPage,
  }) => {
    await projectsPage.goto();

    await expect(projectsPage.newProjectButton).toBeVisible();
    await expect(projectsPage.newProjectButton).toBeEnabled();
  });

  test('project cards display name and metadata', async ({
    projectsPage,
    page,
  }) => {
    await projectsPage.goto();

    const projectCount = await projectsPage.getProjectCount();

    if (projectCount === 0) {
      // When there are no projects the empty state should be shown instead
      await expect(projectsPage.emptyState).toBeVisible();
      return;
    }

    // At least one project card exists - verify its structure
    const firstCard = page
      .locator('a[href^="/projects/"]')
      .filter({ has: page.locator('h3') })
      .first();

    await expect(firstCard).toBeVisible();

    // Card should contain a project name inside an h3
    const projectName = firstCard.locator('h3');
    await expect(projectName).toBeVisible();
    const nameText = await projectName.textContent();
    expect(nameText?.trim().length).toBeGreaterThan(0);
  });

  test('clicking a project card navigates to project detail page', async ({
    projectsPage,
    page,
  }) => {
    await projectsPage.goto();

    const projectCount = await projectsPage.getProjectCount();

    if (projectCount === 0) {
      test.skip();
      return;
    }

    // Get the first project card and its href
    const firstCard = page
      .locator('a[href^="/projects/"]')
      .filter({ has: page.locator('h3') })
      .first();

    const href = await firstCard.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/^\/projects\/\d+/);

    await firstCard.click();
    await page.waitForURL(/\/projects\/\d+/);

    // Should now be on the project detail page
    expect(page.url()).toContain('/projects/');
  });
});

test.describe('Project Detail Page', () => {
  // These tests require at least one project to exist.
  // If the test database has no projects they will be skipped gracefully.

  test.beforeEach(async ({ projectsPage, page }) => {
    await projectsPage.goto();
    const count = await projectsPage.getProjectCount();

    if (count === 0) {
      test.skip();
      return;
    }

    // Navigate to the first project
    const firstCard = page
      .locator('a[href^="/projects/"]')
      .filter({ has: page.locator('h3') })
      .first();
    await firstCard.click();
    await page.waitForURL(/\/projects\/\d+/);
  });

  test('shows 3-column layout on desktop', async ({ page }) => {
    // Ensure desktop viewport
    await page.setViewportSize(VIEWPORTS.desktop);

    // Layout should contain: explorer sidebar, main content, chat panel
    // The project layout renders an aside for the explorer and an aside for chat,
    // plus a <main> element.
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Explorer sidebar is visible at lg breakpoint (1024px+)
    const explorerSidebar = page
      .locator('aside')
      .filter({ has: page.getByText('Completeness') });
    await expect(explorerSidebar).toBeVisible();

    // Chat panel is visible at md breakpoint (768px+)
    const chatPanel = page
      .locator('aside')
      .filter({ has: page.getByText('Chat') });
    await expect(chatPanel).toBeVisible();
  });

  test('explorer sidebar is visible on desktop with nav links', async ({
    projectDetailPage,
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop);

    const explorerVisible = await projectDetailPage.isExplorerVisible();
    expect(explorerVisible).toBe(true);

    // Verify the navigation links exist within the explorer
    await expect(projectDetailPage.navLinks.overview).toBeVisible();
    await expect(projectDetailPage.navLinks.data).toBeVisible();
    await expect(projectDetailPage.navLinks.diagrams).toBeVisible();
  });

  test('chat panel is visible on desktop', async ({
    projectDetailPage,
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop);

    const chatVisible = await projectDetailPage.isChatPanelVisible();
    expect(chatVisible).toBe(true);
  });

  test('project header shows the project name', async ({
    projectsPage,
    page,
  }) => {
    // We need the project name to verify the header.
    // Re-navigate so we can capture the name from the list first.
    await projectsPage.goto();

    const count = await projectsPage.getProjectCount();
    if (count === 0) {
      test.skip();
      return;
    }

    const firstCardName = page
      .locator('a[href^="/projects/"] h3')
      .first();
    const expectedName = await firstCardName.textContent();

    await firstCardName.click();
    await page.waitForURL(/\/projects\/\d+/);

    // The project name should appear somewhere in the project detail header area.
    // The overview page renders the project name inside a CardTitle with text-2xl.
    const projectNameOnDetail = page.locator('main').getByRole('heading', {
      name: new RegExp(expectedName?.trim() ?? '', 'i'),
    });
    await expect(projectNameOnDetail).toBeVisible();
  });
});

test.describe('Project Section Navigation', () => {
  test.beforeEach(async ({ projectsPage, page }) => {
    await projectsPage.goto();
    const count = await projectsPage.getProjectCount();

    if (count === 0) {
      test.skip();
      return;
    }

    // Navigate to first project
    const firstCard = page
      .locator('a[href^="/projects/"]')
      .filter({ has: page.locator('h3') })
      .first();
    await firstCard.click();
    await page.waitForURL(/\/projects\/\d+/);

    // Ensure desktop so the explorer sidebar is visible
    await page.setViewportSize(VIEWPORTS.desktop);
  });

  test('navigating from Overview to Data to Diagrams works', async ({
    projectDetailPage,
    page,
  }) => {
    // Start at the Overview section (default when navigating to /projects/[id])
    const currentUrl = page.url();
    const projectBaseUrl = currentUrl.replace(/\/$/, '');

    // Navigate to Data section
    await projectDetailPage.navigateTo('data');
    await page.waitForURL(/\/projects\/\d+\/data/);
    expect(page.url()).toContain('/data');

    // Navigate to Diagrams section
    await projectDetailPage.navigateTo('diagrams');
    await page.waitForURL(/\/projects\/\d+\/diagrams/);
    expect(page.url()).toContain('/diagrams');

    // Navigate back to Overview
    await projectDetailPage.navigateTo('overview');
    await page.waitForURL(/\/projects\/\d+$/);
    expect(page.url()).toBe(projectBaseUrl);
  });
});
