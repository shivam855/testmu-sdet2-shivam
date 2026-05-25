import { BasePage } from './base.page';
import { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  // ── Locators ────────────────────────────────────────────────
  private readonly emailInput = () => this.page.locator('#email');
  private readonly passwordInput = () => this.page.locator('#password');
  private readonly submitButton = () => this.page.locator('#submit');
  private readonly signupButton = () => this.page.locator('#signup');
  private readonly errorMessage = () => this.page.locator('#error');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput(), email);
    await this.fillField(this.passwordInput(), password);
    await this.submitButton().click();
  }

  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.waitForUrl(/contactList/);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage());
    return (await this.errorMessage().textContent()) ?? '';
  }

  async clickSignup(): Promise<void> {
    await this.signupButton().click();
    await this.waitForUrl(/addUser/);
  }

  async isLoginPageVisible(): Promise<boolean> {
    return this.emailInput().isVisible();
  }
}
