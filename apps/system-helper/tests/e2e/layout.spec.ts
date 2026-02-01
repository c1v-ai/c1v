import { test, expect } from './fixtures/base';
import { VIEWPORTS, BREAKPOINTS } from './helpers/test-data';
import { expectNoHorizontalScroll } from './helpers/assertions';

/**
 * E2E tests for the 3-column responsive layout on the project detail page.
 *
 * Layout structure (project-layout-client.tsx):
 *   - Explorer sidebar: visible at lg (>=1024px), w-60 expanded / w-14 collapsed
 *   - Main content: flex-1, always visible
 *   - Chat panel: visible at md (>=768px), w-[380px] expanded / w-12 collapsed
 *   - Mobile explorer FAB: visible below lg (<1024px), fixed bottom-left
 *   - Mobile chat FAB: visible below md (<768px), fixed bottom-right
 */

// Use a known project ID - navigated via the page object fixture.
// The test relies on authenticated state from auth-setup.
const PROJECT_ID = 1;

test.describe('3-Column Layout - Desktop (>=1024px)', () => {
  test.beforeEach(async ({ projectDetailPage, page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await projectDetailPage.goto(PROJECT_ID);
  });

  test('explorer sidebar is visible', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.explorerSidebar).toBeVisible();
  });

  test('chat panel is visible', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.chatPanel).toBeVisible();
  });

  test('main content is visible', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mainContent).toBeVisible();
  });

  test('all three columns render together', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.explorerSidebar).toBeVisible();
    await expect(projectDetailPage.mainContent).toBeVisible();
    await expect(projectDetailPage.chatPanel).toBeVisible();
  });

  test('mobile explorer FAB is hidden', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mobileExplorerFAB).toBeHidden();
  });

  test('mobile chat FAB is hidden', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mobileChatFAB).toBeHidden();
  });

  test('explorer collapse button narrows sidebar', async ({ projectDetailPage }) => {
    // Verify sidebar starts expanded (w-60 = 240px)
    const expandedBox = await projectDetailPage.explorerSidebar.boundingBox();
    expect(expandedBox).toBeTruthy();
    expect(expandedBox!.width).toBeGreaterThanOrEqual(200);

    // Collapse
    await projectDetailPage.collapseExplorer();

    // Wait for transition (300ms ease-in-out in the component)
    await projectDetailPage.page.waitForTimeout(400);

    // Verify sidebar is now narrow (w-14 = 56px)
    const collapsedBox = await projectDetailPage.explorerSidebar.boundingBox();
    expect(collapsedBox).toBeTruthy();
    expect(collapsedBox!.width).toBeLessThanOrEqual(80);
  });

  test('explorer expand button restores sidebar width', async ({ projectDetailPage }) => {
    // Collapse first
    await projectDetailPage.collapseExplorer();
    await projectDetailPage.page.waitForTimeout(400);

    // Now expand
    await projectDetailPage.expandExplorer();
    await projectDetailPage.page.waitForTimeout(400);

    // Verify sidebar restored to expanded width (w-60 = 240px)
    const restoredBox = await projectDetailPage.explorerSidebar.boundingBox();
    expect(restoredBox).toBeTruthy();
    expect(restoredBox!.width).toBeGreaterThanOrEqual(200);
  });

  test('chat collapse button narrows panel', async ({ projectDetailPage }) => {
    // Verify panel starts expanded (w-[380px])
    const expandedBox = await projectDetailPage.chatPanel.boundingBox();
    expect(expandedBox).toBeTruthy();
    expect(expandedBox!.width).toBeGreaterThanOrEqual(300);

    // Collapse
    await projectDetailPage.collapseChat();
    await projectDetailPage.page.waitForTimeout(400);

    // After collapse, the chat panel re-renders as a narrow strip (w-12 = 48px).
    // The page object's chatPanel locator matches by the "Chat" text, which may
    // no longer be present in the collapsed strip. Instead, look for the narrow aside.
    const collapsedChat = projectDetailPage.page.locator('aside').filter({
      has: projectDetailPage.page.getByRole('button', { name: /expand chat panel/i }),
    });
    const collapsedBox = await collapsedChat.boundingBox();
    expect(collapsedBox).toBeTruthy();
    expect(collapsedBox!.width).toBeLessThanOrEqual(80);
  });

  test('chat expand button restores panel width', async ({ projectDetailPage }) => {
    // Collapse first
    await projectDetailPage.collapseChat();
    await projectDetailPage.page.waitForTimeout(400);

    // Now expand
    await projectDetailPage.expandChat();
    await projectDetailPage.page.waitForTimeout(400);

    // Verify panel restored to expanded width
    const restoredBox = await projectDetailPage.chatPanel.boundingBox();
    expect(restoredBox).toBeTruthy();
    expect(restoredBox!.width).toBeGreaterThanOrEqual(300);
  });

  test('main content fills remaining space between sidebars', async ({ projectDetailPage, page }) => {
    const viewportWidth = VIEWPORTS.desktop.width;

    const explorerBox = await projectDetailPage.explorerSidebar.boundingBox();
    const chatBox = await projectDetailPage.chatPanel.boundingBox();
    const mainBox = await projectDetailPage.mainContent.boundingBox();

    expect(explorerBox).toBeTruthy();
    expect(chatBox).toBeTruthy();
    expect(mainBox).toBeTruthy();

    // Main content should start after the explorer sidebar
    expect(mainBox!.x).toBeGreaterThanOrEqual(explorerBox!.x + explorerBox!.width - 2);

    // Main content should end before the chat panel
    expect(mainBox!.x + mainBox!.width).toBeLessThanOrEqual(chatBox!.x + 2);

    // The three columns should approximately span the full viewport width
    const totalWidth = explorerBox!.width + mainBox!.width + chatBox!.width;
    expect(totalWidth).toBeGreaterThanOrEqual(viewportWidth - 10); // small tolerance for borders
  });
});

test.describe('3-Column Layout - Tablet (768px - 1023px)', () => {
  test.beforeEach(async ({ projectDetailPage, page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await projectDetailPage.goto(PROJECT_ID);
  });

  test('explorer sidebar is hidden', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.explorerSidebar).toBeHidden();
  });

  test('chat panel is visible', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.chatPanel).toBeVisible();
  });

  test('main content is visible', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mainContent).toBeVisible();
  });

  test('mobile explorer FAB is visible at tablet breakpoint', async ({ projectDetailPage }) => {
    // Explorer is hidden below lg, so the FAB should be available
    await expect(projectDetailPage.mobileExplorerFAB).toBeVisible();
  });

  test('mobile chat FAB is hidden at tablet breakpoint', async ({ projectDetailPage }) => {
    // Chat panel is visible at md+, so the mobile chat FAB should be hidden
    await expect(projectDetailPage.mobileChatFAB).toBeHidden();
  });
});

test.describe('3-Column Layout - Mobile (<768px)', () => {
  test.beforeEach(async ({ projectDetailPage, page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await projectDetailPage.goto(PROJECT_ID);
  });

  test('explorer sidebar is hidden', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.explorerSidebar).toBeHidden();
  });

  test('chat panel is hidden', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.chatPanel).toBeHidden();
  });

  test('main content is visible', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mainContent).toBeVisible();
  });

  test('mobile explorer FAB is visible at bottom-left', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mobileExplorerFAB).toBeVisible();

    const fabBox = await projectDetailPage.mobileExplorerFAB.boundingBox();
    expect(fabBox).toBeTruthy();

    // Verify position is at the bottom-left quadrant
    const viewportHeight = VIEWPORTS.mobile.height;
    const viewportWidth = VIEWPORTS.mobile.width;
    expect(fabBox!.x).toBeLessThan(viewportWidth / 2); // left half
    expect(fabBox!.y).toBeGreaterThan(viewportHeight / 2); // bottom half
  });

  test('mobile chat FAB is visible at bottom-right', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.mobileChatFAB).toBeVisible();

    const fabBox = await projectDetailPage.mobileChatFAB.boundingBox();
    expect(fabBox).toBeTruthy();

    // Verify position is at the bottom-right quadrant
    const viewportHeight = VIEWPORTS.mobile.height;
    const viewportWidth = VIEWPORTS.mobile.width;
    expect(fabBox!.x + fabBox!.width).toBeGreaterThan(viewportWidth / 2); // right half
    expect(fabBox!.y).toBeGreaterThan(viewportHeight / 2); // bottom half
  });
});

test.describe('3-Column Layout - No Horizontal Scroll', () => {
  const viewportConfigs = [
    { name: 'mobile', viewport: VIEWPORTS.mobile },
    { name: 'tablet', viewport: VIEWPORTS.tablet },
    { name: 'desktop', viewport: VIEWPORTS.desktop },
    { name: 'desktop-wide', viewport: VIEWPORTS.desktopWide },
  ];

  for (const { name, viewport } of viewportConfigs) {
    test(`no horizontal scroll at ${name} (${viewport.width}x${viewport.height})`, async ({
      projectDetailPage,
      page,
    }) => {
      await page.setViewportSize(viewport);
      await projectDetailPage.goto(PROJECT_ID);

      await expectNoHorizontalScroll(page);
    });
  }
});
