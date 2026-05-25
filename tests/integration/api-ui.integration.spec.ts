import { test, expect } from '../../src/utils/test-fixtures';
import { config } from '../../src/config/env.config';
import contactsData from '../../src/test-data/contacts.json';

test.describe('API ↔ UI Integration @integration', () => {
  test('Create contact via API, verify it appears in UI', async ({
    authenticatedApiClient,
    loginPage,
    contactListPage,
    page,
  }) => {
    // ── Step 1: Create contact via API ────────────────────────
    const suffix = String(Date.now()).slice(-6);
    const contact = {
      ...contactsData.validContacts[0],
      firstName: `IT_${suffix}`,
    };
    const createRes = await authenticatedApiClient.post('/contacts', contact);
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();

    // ── Step 2: Log in via UI and check the contact list ──────
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(
      config.credentials.email,
      config.credentials.password,
    );

    // Wait for the table to populate
    await page.waitForTimeout(2_000);
    const names = await contactListPage.getContactNames();
    const found = names.some((n) => n.includes(contact.firstName));

    // ── Step 3: Cleanup via API ───────────────────────────────
    await authenticatedApiClient.delete(`/contacts/${created._id}`);

    expect(found).toBeTruthy();
  });

  test('Delete contact via API, verify it disappears from UI', async ({
    authenticatedApiClient,
    loginPage,
    contactListPage,
    page,
  }) => {
    // Create
    const suffix = String(Date.now()).slice(-6);
    const contact = {
      ...contactsData.validContacts[1],
      firstName: `DT_${suffix}`,
    };
    const createRes = await authenticatedApiClient.post('/contacts', contact);
    const created = await createRes.json();

    // Delete via API
    const delRes = await authenticatedApiClient.delete(`/contacts/${created._id}`);
    expect(delRes.status()).toBe(200);

    // Verify via UI
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(
      config.credentials.email,
      config.credentials.password,
    );
    await page.waitForTimeout(2_000);

    const names = await contactListPage.getContactNames();
    const found = names.some((n) => n.includes(contact.firstName));
    expect(found).toBeFalsy();
  });
});
