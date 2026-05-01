/**
 * Mobile UI Audit — v2.2.2 front-end upgrade
 *
 * Captures the customer-journey screens at iPhone 12 viewport.
 * Output: plans/v2.2.2-front-end-upgrade/screenshots/NN-name.png
 *
 * Run with:
 *   pnpm test:e2e --project='Mobile Safari' tests/e2e/mobile-v2_2_2-audit.spec.ts
 *
 * Each step is wrapped in try/catch so one failed selector doesn't lose the rest.
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

const SHOTS_DIR = path.resolve(
  __dirname,
  '../../../../plans/v2.2.2-front-end-upgrade/screenshots'
)

async function shoot(page: Page, name: string) {
  const file = path.join(SHOTS_DIR, `${name}.png`)
  try {
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' })
    console.log(`✓ ${name}.png`)
  } catch (err) {
    console.warn(`× ${name}.png — ${(err as Error).message}`)
  }
}

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn()
  } catch (err) {
    console.warn(`× step "${name}" — ${(err as Error).message}`)
  }
}

test.describe('Mobile v2.2.2 audit', () => {
  test.setTimeout(180_000)

  test('walk customer journey on iPhone 12', async ({ page }) => {
    // --- 01: Home / project creation entry ---
    await step('01-home', async () => {
      await page.goto('/home', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(800)
      await shoot(page, '01-home-start')
    })

    // --- 02: Projects list ---
    await step('02-projects-list', async () => {
      await page.goto('/projects', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(800)
      await shoot(page, '02-projects-list')
    })

    // --- 03: Help-me-scope variant on /home ---
    await step('03-help-me-scope', async () => {
      await page.goto('/home', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)
      const helpBtn = page.getByRole('button', { name: /help me scope/i }).first()
      if (await helpBtn.isVisible().catch(() => false)) {
        await helpBtn.click()
        await page.waitForTimeout(300)
      }
      await shoot(page, '03-home-help-me-scope')
    })

    // --- 04: Project details type picker (scrolled) ---
    await step('04-project-types', async () => {
      const detailsToggle = page
        .getByRole('button', { name: /project details/i })
        .first()
      if (await detailsToggle.isVisible().catch(() => false)) {
        await detailsToggle.click()
        await page.waitForTimeout(300)
      }
      await page.evaluate(() => window.scrollBy(0, 320))
      await page.waitForTimeout(200)
      await shoot(page, '04-home-project-types')
    })

    // --- 05: Open the first project from the list ---
    let projectHref: string | null = null
    await step('05-open-first-project', async () => {
      await page.goto('/projects', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(700)
      const firstCardLink = page
        .locator('a[href^="/projects/"]:not([href="/projects/new"])')
        .first()
      projectHref = await firstCardLink.getAttribute('href').catch(() => null)
      if (projectHref) {
        await page.goto(projectHref, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(1000)
        await shoot(page, '05-project-overview')
      }
    })

    // --- 06: Chat panel (open via chat FAB or /chat fallback) ---
    await step('06-chat-panel', async () => {
      // Try opening floating chat first
      const chatFab = page.locator('[aria-label*="chat" i], button:has-text("Chat")').first()
      if (await chatFab.isVisible().catch(() => false)) {
        await chatFab.click().catch(() => {})
        await page.waitForTimeout(800)
        await shoot(page, '06a-chat-floating')
      }
      // Also visit /chat directly
      await page.goto('/chat', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(800)
      await shoot(page, '06b-chat-page')
    })

    // --- 07: System-design routes (frozen viewers) ---
    if (projectHref) {
      await step('07-system-design-routes', async () => {
        const routes = [
          ['07-architecture', `${projectHref}/system-design/decision-matrix`],
          ['08-ffbd', `${projectHref}/system-design/ffbd`],
          ['09-qfd', `${projectHref}/system-design/qfd`],
          ['10-interfaces', `${projectHref}/system-design/interfaces`],
        ] as const
        for (const [name, route] of routes) {
          await page.goto(route, { waitUntil: 'domcontentloaded' })
          await page.waitForTimeout(900)
          await shoot(page, name)
        }
      })

      // --- 11: Requirements section ---
      await step('11-requirements', async () => {
        await page.goto(`${projectHref}/requirements/problem-statement`, {
          waitUntil: 'domcontentloaded',
        })
        await page.waitForTimeout(800)
        await shoot(page, '11-requirements-problem-statement')
      })
    }

    // --- 12: Bottom-nav "More" sheet ---
    await step('12-more-sheet', async () => {
      await page.goto('/projects', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)
      const moreBtn = page.getByRole('button', { name: /more options/i })
      if (await moreBtn.isVisible().catch(() => false)) {
        await moreBtn.click()
        await page.waitForTimeout(400)
        await shoot(page, '12-more-sheet')
      }
    })

    // --- 13: Account page ---
    await step('13-account', async () => {
      await page.goto('/account', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(800)
      await shoot(page, '13-account')
    })

    // --- 14: Marketing landing (logged-out look) ---
    await step('14-marketing-landing', async () => {
      // Strip auth cookies for this view by opening a new context
      await page.context().clearCookies()
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1200)
      await shoot(page, '14-marketing-landing')
      await page.evaluate(() => window.scrollBy(0, 800))
      await page.waitForTimeout(300)
      await shoot(page, '14b-marketing-scrolled')
    })

    // --- 15: Sign-in (after cookies cleared) ---
    await step('15-sign-in', async () => {
      await page.goto('/sign-in', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(600)
      await shoot(page, '15-sign-in')
    })

    expect(true).toBe(true)
  })
})
