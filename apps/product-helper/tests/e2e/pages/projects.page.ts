import type { Page, Locator } from '@playwright/test';

export class ProjectsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newProjectButton: Locator;
  readonly createFirstProjectButton: Locator;
  readonly projectGrid: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /projects/i });
    this.newProjectButton = page.getByRole('link', { name: /new project/i }).or(
      page.getByRole('button', { name: /new project/i })
    );
    this.createFirstProjectButton = page.locator('a[href="/home"]');
    this.projectGrid = page.locator('.grid');
    this.emptyState = page.getByText(/no projects yet/i);
  }

  async goto() {
    await this.page.goto('/projects');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getProjectCard(name: string): Promise<Locator> {
    return this.page.locator('a').filter({ hasText: name });
  }

  async clickProject(name: string) {
    const card = await this.getProjectCard(name);
    await card.click();
  }

  async getProjectCount(): Promise<number> {
    // Each project card is wrapped in an anchor tag linking to /projects/[id]
    const cards = this.page.locator('a[href^="/projects/"]').filter({
      has: this.page.locator('h3'),
    });
    return cards.count();
  }

  async hasEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  async createNewProject() {
    await this.newProjectButton.click();
  }

  async getProjectNames(): Promise<string[]> {
    const cards = this.page.locator('a[href^="/projects/"] h3');
    return cards.allTextContents();
  }
}
