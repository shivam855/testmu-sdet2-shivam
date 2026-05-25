import { test, expect } from '../../src/utils/test-fixtures';
import { getResponseTime } from '../../src/utils/api-client';
import { validateSchema } from '../../src/utils/schema-validator';
import { config } from '../../src/config/env.config';
import usersData from '../../src/test-data/users.json';
import schemas from '../../src/test-data/schemas.json';

test.describe('Authentication API @api', () => {
  test('POST /users/login — valid credentials returns token', async ({ apiClient }) => {
    const user = usersData.validUsers[0];
    const res = await apiClient.post('/users/login', {
      email: user.email,
      password: user.password,
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.token).toBeTruthy();

    // Schema validation
    const { valid, errors } = validateSchema(body, schemas.loginResponseSchema);
    expect(valid, `Schema errors: ${errors.join(', ')}`).toBeTruthy();

    // Response time
    expect(getResponseTime(res)).toBeLessThan(config.api.responseTimeThreshold);
  });

  test('POST /users/login — invalid credentials returns 401', async ({ apiClient }) => {
    const res = await apiClient.post('/users/login', {
      email: 'nonexistent@test.com',
      password: 'WrongPassword!',
    });
    expect(res.status()).toBe(401);
  });

  test('POST /users/login — empty body returns 401', async ({ apiClient }) => {
    const res = await apiClient.post('/users/login', {});
    expect(res.status()).toBe(401);
  });

  test('GET /users/me — unauthenticated returns 401', async ({ apiClient }) => {
    const res = await apiClient.get('/users/me');
    expect(res.status()).toBe(401);
  });

  test('GET /users/me — authenticated returns user profile', async ({
    authenticatedApiClient,
  }) => {
    const res = await authenticatedApiClient.get('/users/me');
    expect(res.status()).toBe(200);

    const body = await res.json();
    const { valid, errors } = validateSchema(body, schemas.userSchema);
    expect(valid, `Schema errors: ${errors.join(', ')}`).toBeTruthy();
  });
});
