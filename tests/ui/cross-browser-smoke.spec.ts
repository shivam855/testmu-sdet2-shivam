import { test, expect } from '../../src/utils/test-fixtures';
import usersData from '../../src/test-data/users.json';

/**
 * Cross-browser smoke test — configured to run on all browser projects
 * (chromium, firefox, webkit) via playwright.config.ts.
 */
test.describe('Cross-Browser Smoke @ui @smoke @cross-browser', () => {
  test('should load the login page correctly', async ({ loginPage, page }) => {
    await loginPage.goto();
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should login and view dashboard across browsers', async ({
    loginPage,
    contactListPage,
  }) => {
    const user = usersData.validUsers[0];
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(user.email, user.password);
    expect(await contactListPage.isAddContactButtonVisible()).toBeTruthy();
  });
});
