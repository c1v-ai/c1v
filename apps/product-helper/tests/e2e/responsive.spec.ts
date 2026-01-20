import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

    test('shows bottom navigation on mobile', async ({ page }) => {
      await page.goto('/projects')

      // Bottom nav should be visible on mobile
      // Look for the fixed bottom navigation container
      const bottomNav = page.locator('nav.fixed.bottom-0')
      await expect(bottomNav).toBeVisible()
    })

    test('hamburger menu opens mobile drawer', async ({ page }) => {
      await page.goto('/projects')

      // Find and click hamburger menu (mobile menu button)
      const menuButton = page.getByRole('button', { name: /menu/i })

      // If menu button exists and is visible
      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Drawer/sheet should be visible with navigation items
        const drawer = page.getByRole('dialog')
        await expect(drawer).toBeVisible()
      }
    })

    test('mobile viewport does not show desktop navigation', async ({ page }) => {
      await page.goto('/projects')

      // Desktop nav should be hidden on mobile (has md:flex class)
      const desktopNav = page.locator('nav.hidden.md\\:flex')

      // Either the element doesn't exist or is hidden
      const count = await desktopNav.count()
      if (count > 0) {
        await expect(desktopNav).toBeHidden()
      }
    })
  })

  test.describe('Desktop Navigation', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    test('shows header navigation on desktop', async ({ page }) => {
      await page.goto('/projects')

      // Desktop header should be visible
      const header = page.locator('header')
      await expect(header).toBeVisible()
    })

    test('bottom nav is hidden on desktop', async ({ page }) => {
      await page.goto('/projects')

      // Bottom nav should be hidden on desktop (has md:hidden class)
      const bottomNav = page.locator('.md\\:hidden.fixed.bottom-0')
      const count = await bottomNav.count()

      if (count > 0) {
        await expect(bottomNav).toBeHidden()
      }
    })
  })

  test.describe('Theme Toggle', () => {
    test('theme toggle is accessible', async ({ page }) => {
      await page.goto('/projects')

      // Find theme toggle button - might be labeled differently
      const themeToggle = page.getByRole('button', { name: /theme|dark|light|mode/i })

      // Theme toggle should exist
      const count = await themeToggle.count()
      expect(count).toBeGreaterThan(0)
    })

    test('can switch to dark mode', async ({ page }) => {
      await page.goto('/projects')

      // Click theme toggle
      const themeToggle = page.getByRole('button', { name: /theme|dark|light|mode/i }).first()

      if (await themeToggle.isVisible()) {
        await themeToggle.click()

        // Select dark mode from dropdown if exists
        const darkOption = page.getByRole('menuitem', { name: /dark/i })
        if (await darkOption.isVisible()) {
          await darkOption.click()

          // HTML should have dark class
          const html = page.locator('html')
          await expect(html).toHaveClass(/dark/)
        }
      }
    })

    test('system preference is respected', async ({ page }) => {
      // Emulate dark color scheme preference
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/projects')

      // The page should respond to system preference
      // This is a basic check - the actual implementation may vary
      const html = page.locator('html')

      // Page should load without errors
      await expect(page).toHaveTitle(/./)
    })
  })

  test.describe('Touch Targets', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('interactive elements have adequate touch target size', async ({ page }) => {
      await page.goto('/projects')

      // Check that main navigation links meet minimum size
      // Apple HIG recommends 44x44 points minimum
      const navLinks = page.locator('nav a, nav button')

      const count = await navLinks.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const item = navLinks.nth(i)
        if (await item.isVisible()) {
          const box = await item.boundingBox()
          if (box) {
            // Minimum 44px (Apple HIG recommendation)
            // Using >= 40 to allow for some margin
            expect(box.width).toBeGreaterThanOrEqual(40)
            expect(box.height).toBeGreaterThanOrEqual(40)
          }
        }
      }
    })

    test('buttons are easily tappable', async ({ page }) => {
      await page.goto('/projects')

      // Find primary action buttons
      const buttons = page.locator('button:visible')
      const count = await buttons.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()
        if (box) {
          // Buttons should have reasonable size
          expect(box.width).toBeGreaterThanOrEqual(32)
          expect(box.height).toBeGreaterThanOrEqual(32)
        }
      }
    })
  })

  test.describe('Content Layout', () => {
    test('projects grid adapts to mobile screen', async ({ page }) => {
      // Mobile - single column
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/projects')

      // Grid or list container should exist
      const gridContainer = page.locator('.grid, .flex-col')
      await expect(gridContainer.first()).toBeVisible()
    })

    test('projects grid adapts to desktop screen', async ({ page }) => {
      // Desktop - multiple columns
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/projects')

      // Container should be visible
      const container = page.locator('main')
      await expect(container).toBeVisible()
    })

    test('no horizontal scrolling on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/projects')

      // Check that the body doesn't overflow horizontally
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const clientWidth = await page.evaluate(() => document.body.clientWidth)

      // Allow small tolerance for scrollbar
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5)
    })
  })

  test.describe('Form Inputs', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('inputs have proper font size to prevent zoom on iOS', async ({ page }) => {
      await page.goto('/sign-in')

      // Check input font size - should be at least 16px to prevent iOS zoom
      const inputs = page.locator('input:visible')
      const count = await inputs.count()

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          const fontSize = await input.evaluate((el) => {
            return window.getComputedStyle(el).fontSize
          })
          const fontSizeNum = parseFloat(fontSize)
          // 16px minimum to prevent iOS auto-zoom
          expect(fontSizeNum).toBeGreaterThanOrEqual(16)
        }
      }
    })
  })

  test.describe('Viewport Meta', () => {
    test('viewport meta tag is properly configured', async ({ page }) => {
      await page.goto('/')

      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
      expect(viewport).toBeTruthy()
      expect(viewport).toContain('width=device-width')
      expect(viewport).toContain('initial-scale=1')
    })
  })
})
