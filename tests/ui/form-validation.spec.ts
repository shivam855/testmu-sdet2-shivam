import { test, expect } from '../../src/utils/test-fixtures';
import contactsData from '../../src/test-data/contacts.json';
import usersData from '../../src/test-data/users.json';

test.describe('Form Validations @ui', () => {
  test.beforeEach(async ({ loginPage, contactListPage }) => {
    const user = usersData.validUsers[0];
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(user.email, user.password);
    await contactListPage.clickAddContact();
  });

  test('should reject empty required fields', async ({ addContactPage }) => {
    await addContactPage.submitForm();
    const error = await addContactPage.getErrorMessage();
    expect(error).toContain('Contact validation failed');
  });

  for (const invalid of contactsData.invalidContacts) {
    test(`should reject: ${invalid.description}`, async ({ addContactPage }) => {
      await addContactPage.fillContactForm({
        firstName: invalid.firstName,
        lastName: invalid.lastName,
        ...(('birthdate' in invalid) ? { birthdate: (invalid as any).birthdate } : {}),
        ...(('email' in invalid && invalid.description.includes('email')) ? { email: (invalid as any).email } : {}),
      });
      await addContactPage.submitForm();
      const error = await addContactPage.getErrorMessage();
      expect(error).toContain(invalid.expectedError);
    });
  }

  test('should cancel form and return to contact list', async ({ addContactPage, page }) => {
    await addContactPage.cancel();
    expect(page.url()).toContain('contactList');
  });
});
