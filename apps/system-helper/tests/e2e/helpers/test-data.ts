/**
 * Test data builders for E2E tests.
 * Generates unique data per test run to avoid collisions in parallel execution.
 */

let counter = 0;

function uniqueId(): string {
  counter++;
  return `${Date.now()}-${counter}`;
}

export function testUser(overrides?: { email?: string; password?: string }) {
  const id = uniqueId();
  return {
    email: overrides?.email ?? `test-${id}@e2e.local`,
    password: overrides?.password ?? `TestPass123!${id}`,
  };
}

export function testProject(overrides?: { name?: string; vision?: string }) {
  const id = uniqueId();
  return {
    name: overrides?.name ?? `E2E Test Project ${id}`,
    vision: overrides?.vision ?? `This is an automated test project created at ${new Date().toISOString()}. It tests the product helper functionality end-to-end.`,
  };
}

/**
 * Well-known test credentials.
 * These must match a seeded user in the test database.
 * Set via E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars,
 * or fall back to defaults matching the seed script.
 */
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e@test.local',
  password: process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!',
};

/**
 * Viewport presets matching the Playwright config device profiles.
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },       // iPhone SE
  mobileLandscape: { width: 844, height: 390 },
  tablet: { width: 810, height: 1080 },      // iPad
  desktop: { width: 1280, height: 720 },
  desktopWide: { width: 1920, height: 1080 },
} as const;

/**
 * Breakpoints matching the Tailwind / CSS used in the app.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,   // Chat panel visible
  lg: 1024,  // Explorer sidebar visible
  xl: 1280,
  '2xl': 1536,
} as const;
