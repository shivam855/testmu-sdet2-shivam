import { test, expect } from '../../src/utils/test-fixtures';
import usersData from '../../src/test-data/users.json';

test.describe('Login Flow @ui @smoke', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display the login page', async ({ loginPage }) => {
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
  });

  test('should login with valid credentials and reach dashboard', async ({ loginPage, contactListPage }) => {
    const user = usersData.validUsers[0];
    await loginPage.loginAndWaitForDashboard(user.email, user.password);
    expect(await contactListPage.isAddContactButtonVisible()).toBeTruthy();
  });

  for (const invalidUser of usersData.invalidUsers) {
    test(`should show error for: ${invalidUser.description}`, async ({ loginPage }) => {
      await loginPage.login(invalidUser.email, invalidUser.password);
      const error = await loginPage.getErrorMessage();
      expect(error).toContain(invalidUser.expectedError);
    });
  }

  test('should navigate to signup page', async ({ loginPage, page }) => {
    await loginPage.clickSignup();
    expect(page.url()).toContain('addUser');
  });

  test('should logout successfully', async ({ loginPage, contactListPage, page }) => {
    const user = usersData.validUsers[0];
    await loginPage.loginAndWaitForDashboard(user.email, user.password);
    await contactListPage.logout();
    // After logout, we should be redirected to the login/root page
    await page.waitForURL('**/', { timeout: 10_000 });
    await page.waitForTimeout(1_000);
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
  });
});
