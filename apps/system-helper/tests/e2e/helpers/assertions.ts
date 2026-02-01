import { expect, type Page } from '@playwright/test';

/**
 * Assert that the page has no severe console errors.
 * Collects console messages during the check and fails on error-level messages.
 * Ignores known benign warnings (hydration, React dev mode, etc.).
 */
export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];

  const ignoredPatterns = [
    /Download the React DevTools/,
    /Warning: ReactDOM/,
    /hydration/i,
    /favicon\.ico/,
    /ERR_CONNECTION_REFUSED/, // Dev server not ready
  ];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const isIgnored = ignoredPatterns.some((p) => p.test(text));
      if (!isIgnored) {
        errors.push(text);
      }
    }
  });

  // Give the page a moment to settle
  await page.waitForTimeout(500);

  expect(errors, 'Expected no console errors').toHaveLength(0);
}

/**
 * Assert that the page has no horizontal overflow (no unwanted horizontal scrollbar).
 */
export async function expectNoHorizontalScroll(page: Page) {
  const result = await page.evaluate(() => ({
    scrollWidth: document.body.scrollWidth,
    clientWidth: document.body.clientWidth,
  }));

  expect(
    result.scrollWidth,
    `Body scrollWidth (${result.scrollWidth}) should not exceed clientWidth (${result.clientWidth})`
  ).toBeLessThanOrEqual(result.clientWidth + 2); // 2px tolerance
}

/**
 * Assert that an element meets minimum touch target size (44x44px per Apple HIG).
 */
export async function expectAdequateTouchTarget(
  page: Page,
  selector: string,
  minSize = 44
) {
  const elements = page.locator(selector);
  const count = await elements.count();

  for (let i = 0; i < count; i++) {
    const el = elements.nth(i);
    if (await el.isVisible()) {
      const box = await el.boundingBox();
      if (box) {
        expect(box.width, `Touch target width for ${selector}[${i}]`).toBeGreaterThanOrEqual(minSize);
        expect(box.height, `Touch target height for ${selector}[${i}]`).toBeGreaterThanOrEqual(minSize);
      }
    }
  }
}

/**
 * Wait for network to be idle (no pending requests for 500ms).
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}
