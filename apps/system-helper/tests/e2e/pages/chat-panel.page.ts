import type { Page, Locator } from '@playwright/test';

/**
 * Page object for interacting with the chat panel (desktop + mobile sheet).
 * Works for both the sidebar chat panel and the mobile chat sheet.
 */
export class ChatPanelPage {
  readonly page: Page;
  readonly textarea: Locator;
  readonly sendButton: Locator;
  readonly stopButton: Locator;
  readonly messages: Locator;
  readonly progressCard: Locator;
  readonly progressTitle: Locator;
  readonly progressStage: Locator;
  readonly progressBar: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator('textarea');
    this.sendButton = page.getByRole('button', { name: /send/i });
    this.stopButton = page.getByRole('button', { name: /stop/i });

    // Chat messages - user and assistant message blocks
    this.messages = page.locator('[class*="whitespace-pre-wrap"]');

    // Progress card elements
    this.progressCard = page.locator('text=/Generating Response|Processing Data|Generation Complete/').locator('..');
    this.progressTitle = page.locator('text=/Generating Response|Processing Data|Generation Complete/');
    this.progressStage = page.locator('text=/Stage \\d+\\/\\d+/');
    this.progressBar = page.locator('.animate-pulse, .h-1\\.5');

    // Empty state for new projects
    this.emptyState = page.getByText(/welcome to/i);
  }

  async sendMessage(message: string) {
    await this.textarea.fill(message);
    await this.sendButton.click();
  }

  async sendMessageWithEnter(message: string) {
    await this.textarea.fill(message);
    await this.textarea.press('Enter');
  }

  async stopGeneration() {
    await this.stopButton.click();
  }

  async isGenerating(): Promise<boolean> {
    return this.stopButton.isVisible();
  }

  async getMessageCount(): Promise<number> {
    return this.messages.count();
  }

  async getLastMessage(): Promise<string | null> {
    const count = await this.messages.count();
    if (count === 0) return null;
    return this.messages.nth(count - 1).textContent();
  }

  async waitForResponse(timeout = 30000) {
    // Wait for the assistant to finish responding (stop button disappears)
    await this.stopButton.waitFor({ state: 'hidden', timeout });
  }

  async waitForProgressCard(timeout = 10000) {
    await this.progressTitle.waitFor({ state: 'visible', timeout });
  }

  async waitForProgressComplete(timeout = 60000) {
    await this.page.getByText('Generation Complete').waitFor({ state: 'visible', timeout });
  }

  async hasEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  async isProgressCardVisible(): Promise<boolean> {
    return this.progressCard.isVisible();
  }

  async getProgressStage(): Promise<string | null> {
    if (await this.progressStage.isVisible()) {
      return this.progressStage.textContent();
    }
    return null;
  }
}
