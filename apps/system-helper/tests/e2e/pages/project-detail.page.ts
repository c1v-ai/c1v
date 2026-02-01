import type { Page, Locator } from '@playwright/test';

/**
 * Page object for the project detail 3-column layout.
 * Covers: header, explorer sidebar, chat panel, and mobile variants.
 */
export class ProjectDetailPage {
  readonly page: Page;

  // Header
  readonly headerProjectName: Locator;
  readonly headerStatusBadge: Locator;

  // Explorer sidebar (desktop)
  readonly explorerSidebar: Locator;
  readonly explorerCollapseButton: Locator;
  readonly explorerExpandButton: Locator;
  readonly completenessBar: Locator;
  readonly completenessPercentage: Locator;

  // Chat panel (desktop)
  readonly chatPanel: Locator;
  readonly chatCollapseButton: Locator;
  readonly chatExpandButton: Locator;
  readonly chatMessageCount: Locator;

  // Main content
  readonly mainContent: Locator;

  // Mobile elements
  readonly mobileExplorerFAB: Locator;
  readonly mobileChatFAB: Locator;

  // Explorer nav links
  readonly navLinks: {
    overview: Locator;
    data: Locator;
    diagrams: Locator;
    connections: Locator;
    settings: Locator;
  };

  // Explorer sections
  readonly actorsSection: Locator;
  readonly useCasesSection: Locator;
  readonly dataEntitiesSection: Locator;
  readonly diagramsSection: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.headerProjectName = page.locator('[style*="font-heading"]').first();
    this.headerStatusBadge = page.locator('.rounded-full.px-2, .rounded-full.px-1\\.5').first();

    // Explorer sidebar
    this.explorerSidebar = page.locator('aside').filter({ has: page.getByText('Completeness') });
    this.explorerCollapseButton = page.getByRole('button', { name: /collapse explorer/i });
    this.explorerExpandButton = page.getByRole('button', { name: /expand explorer/i });
    this.completenessBar = page.locator('.rounded-full.overflow-hidden').first();
    this.completenessPercentage = page.locator('text=/\\d+%/').first();

    // Chat panel
    this.chatPanel = page.locator('aside').filter({ has: page.getByText('Chat') });
    this.chatCollapseButton = page.getByRole('button', { name: /collapse chat panel/i });
    this.chatExpandButton = page.getByRole('button', { name: /expand chat panel/i });
    this.chatMessageCount = page.locator('aside .rounded-full').filter({ hasText: /^\d+$/ });

    // Main content
    this.mainContent = page.locator('main');

    // Mobile FABs
    this.mobileExplorerFAB = page.locator('.fixed.bottom-20.left-4');
    this.mobileChatFAB = page.locator('.fixed.bottom-20.right-4');

    // Nav links in explorer
    this.navLinks = {
      overview: page.locator('nav a').filter({ hasText: 'Overview' }),
      data: page.locator('nav a').filter({ hasText: 'Data' }),
      diagrams: page.locator('nav a').filter({ hasText: 'Diagrams' }),
      connections: page.locator('nav a').filter({ hasText: 'Connections' }),
      settings: page.locator('nav a').filter({ hasText: 'Settings' }),
    };

    // Collapsible sections
    this.actorsSection = page.getByRole('button', { name: /actors/i });
    this.useCasesSection = page.getByRole('button', { name: /use cases/i });
    this.dataEntitiesSection = page.getByRole('button', { name: /data entities/i });
    this.diagramsSection = page.getByRole('button', { name: /diagrams/i });
  }

  async goto(projectId: number) {
    await this.page.goto(`/projects/${projectId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateTo(section: keyof typeof this.navLinks) {
    await this.navLinks[section].click();
  }

  async collapseExplorer() {
    await this.explorerCollapseButton.click();
  }

  async expandExplorer() {
    await this.explorerExpandButton.click();
  }

  async collapseChat() {
    await this.chatCollapseButton.click();
  }

  async expandChat() {
    await this.chatExpandButton.click();
  }

  async isExplorerVisible(): Promise<boolean> {
    return this.explorerSidebar.isVisible();
  }

  async isChatPanelVisible(): Promise<boolean> {
    return this.chatPanel.isVisible();
  }

  async getCompleteness(): Promise<string | null> {
    return this.completenessPercentage.textContent();
  }

  async openMobileExplorer() {
    await this.mobileExplorerFAB.click();
  }

  async openMobileChat() {
    await this.mobileChatFAB.click();
  }

  async toggleSection(section: 'actors' | 'useCases' | 'dataEntities' | 'diagrams') {
    const sectionMap = {
      actors: this.actorsSection,
      useCases: this.useCasesSection,
      dataEntities: this.dataEntitiesSection,
      diagrams: this.diagramsSection,
    };
    await sectionMap[section].click();
  }
}
