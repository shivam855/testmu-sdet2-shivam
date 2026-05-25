import { test, expect } from '../../src/utils/test-fixtures';
import { getResponseTime } from '../../src/utils/api-client';
import { validateSchema } from '../../src/utils/schema-validator';
import { config } from '../../src/config/env.config';
import contactsData from '../../src/test-data/contacts.json';
import schemas from '../../src/test-data/schemas.json';

test.describe('Contacts CRUD API @api', () => {
  let createdContactId: string;

  test('POST /contacts — create a contact', async ({ authenticatedApiClient }) => {
    const contact = contactsData.validContacts[0];
    const res = await authenticatedApiClient.post('/contacts', contact);
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body._id).toBeTruthy();
    createdContactId = body._id;

    // Schema validation
    const { valid, errors } = validateSchema(body, schemas.contactSchema);
    expect(valid, `Schema errors: ${errors.join(', ')}`).toBeTruthy();

    expect(body.firstName).toBe(contact.firstName);
    expect(body.lastName).toBe(contact.lastName);

    // Response time
    expect(getResponseTime(res)).toBeLessThan(config.api.responseTimeThreshold);
  });

  test('GET /contacts — list all contacts', async ({ authenticatedApiClient }) => {
    const res = await authenticatedApiClient.get('/contacts');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();

    expect(getResponseTime(res)).toBeLessThan(config.api.responseTimeThreshold);
  });

  test('GET /contacts/:id — get single contact', async ({ authenticatedApiClient }) => {
    // First create one
    const contact = contactsData.validContacts[1];
    const createRes = await authenticatedApiClient.post('/contacts', contact);
    const created = await createRes.json();

    const res = await authenticatedApiClient.get(`/contacts/${created._id}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.firstName).toBe(contact.firstName);
    expect(body._id).toBe(created._id);

    // Cleanup
    await authenticatedApiClient.delete(`/contacts/${created._id}`);
  });

  test('PUT /contacts/:id — update a contact', async ({ authenticatedApiClient }) => {
    // Create
    const contact = contactsData.validContacts[0];
    const createRes = await authenticatedApiClient.post('/contacts', contact);
    const created = await createRes.json();

    // Update
    const res = await authenticatedApiClient.put(`/contacts/${created._id}`, {
      ...contact,
      firstName: 'Updated',
      lastName: 'Name',
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.firstName).toBe('Updated');
    expect(body.lastName).toBe('Name');

    // Cleanup
    await authenticatedApiClient.delete(`/contacts/${created._id}`);
  });

  test('DELETE /contacts/:id — delete a contact', async ({ authenticatedApiClient }) => {
    // Create
    const createRes = await authenticatedApiClient.post('/contacts', contactsData.validContacts[0]);
    const created = await createRes.json();

    const res = await authenticatedApiClient.delete(`/contacts/${created._id}`);
    expect(res.status()).toBe(200);

    // Verify deleted
    const getRes = await authenticatedApiClient.get(`/contacts/${created._id}`);
    expect(getRes.status()).toBe(404);
  });

  test('POST /contacts — invalid data returns 400', async ({ authenticatedApiClient }) => {
    const res = await authenticatedApiClient.post('/contacts', {});
    expect(res.status()).toBe(400);
  });

  test('GET /contacts/:id — non-existent returns 404', async ({ authenticatedApiClient }) => {
    const res = await authenticatedApiClient.get('/contacts/000000000000000000000000');
    // API may return 404 or similar
    expect([400, 404]).toContain(res.status());
  });

  test('GET /contacts — unauthenticated returns 401', async ({ apiClient }) => {
    const res = await apiClient.get('/contacts');
    expect(res.status()).toBe(401);
  });

  // Parameterized: create multiple contacts from test data
  for (const contact of contactsData.validContacts) {
    test(`POST /contacts — create ${contact.firstName} ${contact.lastName}`, async ({
      authenticatedApiClient,
    }) => {
      const res = await authenticatedApiClient.post('/contacts', contact);
      expect(res.status()).toBe(201);

      const body = await res.json();
      expect(body.firstName).toBe(contact.firstName);

      // Cleanup
      await authenticatedApiClient.delete(`/contacts/${body._id}`);
    });
  }
});
