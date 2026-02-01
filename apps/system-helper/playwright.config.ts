import { defineConfig, devices } from '@playwright/test'

const AUTH_STATE_PATH = 'tests/e2e/.auth/user.json';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  projects: [
    // ── Auth setup (runs first, saves storage state) ──────────
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ── Unauthenticated tests (no auth state, any spec) ──────
    {
      name: 'unauthenticated',
      testMatch: /\bauth\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Desktop authenticated ─────────────────────────────────
    {
      name: 'chromium',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    },
    {
      name: 'firefox',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_STATE_PATH,
      },
    },
    {
      name: 'webkit',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['Desktop Safari'],
        storageState: AUTH_STATE_PATH,
      },
    },

    // ── Mobile authenticated ──────────────────────────────────
    {
      name: 'Mobile Chrome',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['Pixel 5'],
        storageState: AUTH_STATE_PATH,
      },
    },
    {
      name: 'Mobile Safari',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['iPhone 12'],
        storageState: AUTH_STATE_PATH,
      },
    },
    {
      name: 'Mobile Safari (landscape)',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 844, height: 390 },
        storageState: AUTH_STATE_PATH,
      },
    },

    // ── Tablet authenticated ──────────────────────────────────
    {
      name: 'iPad',
      dependencies: ['auth-setup'],
      testIgnore: /\bauth\.spec\.ts$/,
      use: {
        ...devices['iPad (gen 7)'],
        storageState: AUTH_STATE_PATH,
      },
    },
  ],

  // Start dev server for tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
