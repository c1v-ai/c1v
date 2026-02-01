import type { Page, Locator } from '@playwright/test';

export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-500');
    this.forgotPasswordLink = page.locator('a[href="/forgot-password"]');
    this.signUpLink = page.locator('a[href="/sign-up"]');
    this.loadingIndicator = page.getByText('Loading...');
  }

  async goto() {
    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async signInAndWait(email: string, password: string) {
    await this.signIn(email, password);
    await this.page.waitForURL('**/projects**', {
      timeout: 60000,
      waitUntil: 'commit',
    });
  }

  async getError(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }

  async isLoading(): Promise<boolean> {
    return this.loadingIndicator.isVisible();
  }
}
