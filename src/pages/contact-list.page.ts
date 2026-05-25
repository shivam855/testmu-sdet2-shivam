import { BasePage } from './base.page';
import { Page, Locator } from '@playwright/test';

export class ContactListPage extends BasePage {
  // ── Locators ────────────────────────────────────────────────
  private readonly addContactButton = () => this.page.locator('#add-contact');
  private readonly logoutButton = () => this.page.locator('#logout');
  private readonly contactTable = () => this.page.locator('.contactTable');
  private readonly contactRows = () => this.page.locator('.contactTableBodyRow');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/contactList');
  }

  async clickAddContact(): Promise<void> {
    await this.addContactButton().click();
    await this.waitForUrl(/addContact/);
  }

  async logout(): Promise<void> {
    await this.logoutButton().click();
    await this.page.waitForTimeout(2_000);
  }

  async getContactCount(): Promise<number> {
    await this.page.waitForTimeout(1_000); // allow table to load
    return this.contactRows().count();
  }

  async getContactNames(): Promise<string[]> {
    const rows = this.contactRows();
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const name = await cells.nth(1).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async clickContact(index: number): Promise<void> {
    await this.contactRows().nth(index).click();
    await this.waitForUrl(/contactDetails/);
  }

  async isContactTableVisible(): Promise<boolean> {
    return this.contactTable().isVisible();
  }

  async isAddContactButtonVisible(): Promise<boolean> {
    return this.addContactButton().isVisible();
  }
}
