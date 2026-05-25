import { BasePage } from './base.page';
import { Page } from '@playwright/test';

export class ContactDetailsPage extends BasePage {
  private readonly editButton = () => this.page.locator('#edit-contact');
  private readonly deleteButton = () => this.page.locator('#delete');
  private readonly returnButton = () => this.page.locator('#return');
  private readonly firstName = () => this.page.locator('#firstName');
  private readonly lastName = () => this.page.locator('#lastName');
  private readonly email = () => this.page.locator('#email');
  private readonly phone = () => this.page.locator('#phone');
  private readonly city = () => this.page.locator('#city');

  constructor(page: Page) {
    super(page);
  }

  async getContactName(): Promise<string> {
    const first = (await this.firstName().textContent()) ?? '';
    const last = (await this.lastName().textContent()) ?? '';
    return `${first.trim()} ${last.trim()}`;
  }

  async getEmail(): Promise<string> {
    return ((await this.email().textContent()) ?? '').trim();
  }

  async getPhone(): Promise<string> {
    return ((await this.phone().textContent()) ?? '').trim();
  }

  async getCity(): Promise<string> {
    return ((await this.city().textContent()) ?? '').trim();
  }

  async clickEdit(): Promise<void> {
    await this.editButton().click();
  }

  async deleteContact(): Promise<void> {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.deleteButton().click();
    await this.waitForUrl(/contactList/);
  }

  async returnToList(): Promise<void> {
    await this.returnButton().click();
    await this.waitForUrl(/contactList/);
  }
}
