import { test, expect } from './fixtures/base';
import { VIEWPORTS } from './helpers/test-data';

/**
 * E2E tests for the chat / PRD intake panel.
 *
 * These tests validate UI state and interactions that do not depend on an AI
 * response. They run against a real project page using stored auth state.
 *
 * Prerequisite: a seeded project must exist at /projects/1 (created by the
 * test database seed script). If the ID differs, set E2E_PROJECT_ID.
 */

const PROJECT_ID = Number(process.env.E2E_PROJECT_ID ?? '1');
const PROJECT_URL = `/projects/${PROJECT_ID}`;

// ---------------------------------------------------------------------------
// Desktop chat panel
// ---------------------------------------------------------------------------

test.describe('Chat Panel - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(PROJECT_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('chat panel is visible on project page', async ({ projectDetailPage }) => {
    await expect(projectDetailPage.chatPanel).toBeVisible();
  });

  test('chat input textarea is present and focusable', async ({ chatPanelPage }) => {
    await expect(chatPanelPage.textarea).toBeVisible();
    await chatPanelPage.textarea.focus();
    await expect(chatPanelPage.textarea).toBeFocused();
  });

  test('send button is disabled when input is empty', async ({ chatPanelPage }) => {
    // Ensure textarea is empty
    await chatPanelPage.textarea.fill('');
    await expect(chatPanelPage.sendButton).toBeDisabled();
  });

  test('can type a message in the textarea', async ({ chatPanelPage }) => {
    const message = 'I want to build an e-commerce platform';
    await chatPanelPage.textarea.fill(message);
    await expect(chatPanelPage.textarea).toHaveValue(message);
  });

  test('chat panel collapse and expand toggle works', async ({
    page,
    projectDetailPage,
  }) => {
    // Panel should start expanded
    await expect(projectDetailPage.chatPanel).toBeVisible();

    // Collapse
    await projectDetailPage.collapseChat();

    // The expand button should now be visible (collapsed strip shows it)
    await expect(projectDetailPage.chatExpandButton).toBeVisible();

    // The textarea should no longer be visible (panel is collapsed)
    const textarea = page.locator('textarea');
    await expect(textarea).toBeHidden();

    // Expand
    await projectDetailPage.expandChat();

    // Textarea should be visible again
    await expect(textarea).toBeVisible();
  });

  test('empty state shows welcome message for new project', async ({
    page,
    chatPanelPage,
  }) => {
    // The empty state is only rendered for new projects with zero messages.
    // If the seeded project already has messages this assertion will be skipped.
    const messageCount = await chatPanelPage.getMessageCount();

    if (messageCount === 0) {
      await expect(chatPanelPage.emptyState).toBeVisible();
      // Verify welcome text pattern: "Welcome to {projectName}"
      await expect(page.getByText(/welcome to/i)).toBeVisible();
    } else {
      // Project already has messages -- empty state should NOT appear
      await expect(chatPanelPage.emptyState).toBeHidden();
    }
  });

  test('chat panel header shows "Chat" title with message count', async ({
    page,
    projectDetailPage,
  }) => {
    // The header contains a "Chat" label
    const chatHeader = projectDetailPage.chatPanel.getByText('Chat');
    await expect(chatHeader).toBeVisible();

    // If messages exist the badge (message count) should be visible
    const badgeLocator = projectDetailPage.chatMessageCount;
    const badgeCount = await badgeLocator.count();

    if (badgeCount > 0) {
      // Badge text should be a number
      const text = await badgeLocator.first().textContent();
      expect(Number(text)).toBeGreaterThanOrEqual(0);
    }
  });

  test('chat input placeholder text is shown', async ({ chatPanelPage }) => {
    await expect(chatPanelPage.textarea).toHaveAttribute(
      'placeholder',
      'Share your thoughts about the project...',
    );
  });
});

// ---------------------------------------------------------------------------
// Mobile chat sheet
// ---------------------------------------------------------------------------

test.describe('Chat Panel - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(PROJECT_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('FAB button is visible on mobile viewport', async ({ projectDetailPage }) => {
    // The mobile chat FAB is rendered inside the md:hidden wrapper
    await expect(projectDetailPage.mobileChatFAB).toBeVisible();
  });

  test('chat sheet opens on FAB click', async ({ projectDetailPage, page }) => {
    await projectDetailPage.openMobileChat();

    // The sheet should open and show the chat header
    const sheetHeader = page.getByText(/Chat -/);
    await expect(sheetHeader).toBeVisible({ timeout: 5000 });

    // Textarea inside the sheet should be present
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
  });
});
