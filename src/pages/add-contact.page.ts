import { BasePage } from './base.page';
import { Page } from '@playwright/test';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  birthdate?: string;
  email?: string;
  phone?: string;
  street1?: string;
  street2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}

export class AddContactPage extends BasePage {
  // ── Locators ────────────────────────────────────────────────
  private readonly firstNameInput = () => this.page.locator('#firstName');
  private readonly lastNameInput = () => this.page.locator('#lastName');
  private readonly birthdateInput = () => this.page.locator('#birthdate');
  private readonly emailInput = () => this.page.locator('#email');
  private readonly phoneInput = () => this.page.locator('#phone');
  private readonly street1Input = () => this.page.locator('#street1');
  private readonly street2Input = () => this.page.locator('#street2');
  private readonly cityInput = () => this.page.locator('#city');
  private readonly stateInput = () => this.page.locator('#stateProvince');
  private readonly postalCodeInput = () => this.page.locator('#postalCode');
  private readonly countryInput = () => this.page.locator('#country');
  private readonly submitButton = () => this.page.locator('#submit');
  private readonly cancelButton = () => this.page.locator('#cancel');
  private readonly errorMessage = () => this.page.locator('#error');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/addContact');
  }

  async fillContactForm(data: ContactFormData): Promise<void> {
    await this.fillField(this.firstNameInput(), data.firstName);
    await this.fillField(this.lastNameInput(), data.lastName);
    if (data.birthdate) await this.fillField(this.birthdateInput(), data.birthdate);
    if (data.email) await this.fillField(this.emailInput(), data.email);
    if (data.phone) await this.fillField(this.phoneInput(), data.phone);
    if (data.street1) await this.fillField(this.street1Input(), data.street1);
    if (data.street2) await this.fillField(this.street2Input(), data.street2);
    if (data.city) await this.fillField(this.cityInput(), data.city);
    if (data.stateProvince) await this.fillField(this.stateInput(), data.stateProvince);
    if (data.postalCode) await this.fillField(this.postalCodeInput(), data.postalCode);
    if (data.country) await this.fillField(this.countryInput(), data.country);
  }

  async submitForm(): Promise<void> {
    await this.submitButton().click();
  }

  async submitAndWaitForContactList(): Promise<void> {
    await this.submitButton().click();
    await this.waitForUrl(/contactList/);
  }

  async cancel(): Promise<void> {
    await this.cancelButton().click();
    await this.waitForUrl(/contactList/);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage());
    return (await this.errorMessage().textContent()) ?? '';
  }
}
