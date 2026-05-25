import { Page, Locator } from '@playwright/test';

/**
 * BasePage: foundation for all Page Objects.
 * Provides common navigation, wait, and interaction helpers.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────
  async navigate(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForUrl(urlPattern: string | RegExp, timeout = 10_000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  // ── Element helpers ─────────────────────────────────────────
  protected getByTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  protected getByRole(role: Parameters<Page['getByRole']>[0], opts?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, opts);
  }

  protected getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  protected getByLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }

  protected getByPlaceholder(text: string | RegExp): Locator {
    return this.page.getByPlaceholder(text);
  }

  // ── Waits ───────────────────────────────────────────────────
  async waitForElement(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForElementHidden(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async waitForNetworkIdle(timeout = 5_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // ── Actions ─────────────────────────────────────────────────
  async clickAndWait(locator: Locator, urlPattern?: string | RegExp): Promise<void> {
    await locator.click();
    if (urlPattern) {
      await this.waitForUrl(urlPattern);
    }
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  // ── State ───────────────────────────────────────────────────
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }
}
