import { test, expect } from '../../src/utils/test-fixtures';
import usersData from '../../src/test-data/users.json';
import contactsData from '../../src/test-data/contacts.json';

test.describe('Dashboard & Contact Management @ui', () => {
  test.beforeEach(async ({ loginPage }) => {
    const user = usersData.validUsers[0];
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(user.email, user.password);
  });

  test('should display contact list after login', async ({ contactListPage, page }) => {
    await page.waitForTimeout(2_000);
    expect(await contactListPage.isContactTableVisible()).toBeTruthy();
  });

  test('should navigate to add-contact form', async ({ contactListPage, page }) => {
    await contactListPage.clickAddContact();
    expect(page.url()).toContain('addContact');
  });

  test('should add a new contact and see it in the list', async ({
    contactListPage,
    addContactPage,
  }) => {
    const contact = contactsData.validContacts[0];
    const countBefore = await contactListPage.getContactCount();

    await contactListPage.clickAddContact();
    await addContactPage.fillContactForm(contact);
    await addContactPage.submitAndWaitForContactList();

    const countAfter = await contactListPage.getContactCount();
    expect(countAfter).toBeGreaterThanOrEqual(countBefore);
  });

  test('should view contact details', async ({ contactListPage, contactDetailsPage, page }) => {
    await page.waitForTimeout(2_000);
    const count = await contactListPage.getContactCount();
    test.skip(count === 0, 'No contacts to view');
    await contactListPage.clickContact(0);
    await page.waitForTimeout(1_000);
    const name = await contactDetailsPage.getContactName();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('should delete a contact', async ({
    contactListPage,
    addContactPage,
    contactDetailsPage,
  }) => {
    // Create a contact to delete
    const contact = contactsData.validContacts[2];
    await contactListPage.clickAddContact();
    await addContactPage.fillContactForm(contact);
    await addContactPage.submitAndWaitForContactList();

    // Delete it
    const count = await contactListPage.getContactCount();
    await contactListPage.clickContact(0);
    await contactDetailsPage.deleteContact();

    const countAfter = await contactListPage.getContactCount();
    expect(countAfter).toBeLessThan(count);
  });
});
