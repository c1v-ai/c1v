import type { Page, Locator } from '@playwright/test';

/**
 * Page object for the dashboard layout shell (header, nav, mobile menu).
 * Used across all authenticated pages.
 */
export class DashboardPage {
  readonly page: Page;

  // Header elements
  readonly logo: Locator;
  readonly desktopNav: Locator;
  readonly homeLink: Locator;
  readonly projectsLink: Locator;
  readonly chatLink: Locator;

  // User menu
  readonly userMenuTrigger: Locator;
  readonly signOutButton: Locator;

  // Theme
  readonly themeToggle: Locator;

  // Mobile
  readonly mobileMenuButton: Locator;
  readonly bottomNav: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.logo = page.locator('header a[href="/"]').first();
    this.desktopNav = page.locator('header nav');
    this.homeLink = page.locator('header a[href="/projects"]').first();
    this.projectsLink = page.locator('header a').filter({ hasText: 'Projects' });
    this.chatLink = page.locator('header a').filter({ hasText: 'Chat' });

    // User menu
    this.userMenuTrigger = page.locator('header').getByRole('button').last();
    this.signOutButton = page.getByRole('menuitem', { name: /sign out/i });

    // Theme toggle
    this.themeToggle = page.getByRole('button', { name: /theme|dark|light|mode/i });

    // Mobile
    this.mobileMenuButton = page.getByRole('button', { name: /open menu|menu/i });
    this.bottomNav = page.locator('nav.fixed.bottom-0');
  }

  async navigateToProjects() {
    await this.projectsLink.click();
  }

  async navigateToChat() {
    await this.chatLink.click();
  }

  async navigateHome() {
    await this.logo.click();
  }

  async signOut() {
    await this.userMenuTrigger.click();
    await this.signOutButton.click();
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async isDarkMode(): Promise<boolean> {
    const html = this.page.locator('html');
    const className = await html.getAttribute('class');
    return className?.includes('dark') ?? false;
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }

  async isDesktopNavVisible(): Promise<boolean> {
    return this.desktopNav.isVisible();
  }

  async isBottomNavVisible(): Promise<boolean> {
    return this.bottomNav.isVisible();
  }
}
