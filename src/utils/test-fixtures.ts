import { test as base, Page, request as pwRequest } from '@playwright/test';
import { LoginPage, ContactListPage, AddContactPage, ContactDetailsPage } from '../pages';
import { ApiClient } from './api-client';
import { config } from '../config/env.config';

/**
 * Custom test fixtures that give every test pre-built page objects
 * and an authenticated API client.
 */
type TestFixtures = {
  loginPage: LoginPage;
  contactListPage: ContactListPage;
  addContactPage: AddContactPage;
  contactDetailsPage: ContactDetailsPage;
  apiClient: ApiClient;
  authenticatedApiClient: ApiClient;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  contactListPage: async ({ page }, use) => {
    await use(new ContactListPage(page));
  },

  addContactPage: async ({ page }, use) => {
    await use(new AddContactPage(page));
  },

  contactDetailsPage: async ({ page }, use) => {
    await use(new ContactDetailsPage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  authenticatedApiClient: async ({ playwright }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: config.apiUrl,
    });
    const client = new ApiClient(apiContext);
    await client.authenticate(config.credentials.email, config.credentials.password);
    await use(client);
    await apiContext.dispose();
  },
});

export { expect } from '@playwright/test';
