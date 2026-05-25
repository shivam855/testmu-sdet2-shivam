import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  baseUrl: process.env.BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com',
  apiUrl: process.env.API_URL || 'https://thinking-tester-contact-list.herokuapp.com',
  env: process.env.ENV || 'staging',

  credentials: {
    email: process.env.TEST_USER_EMAIL || 'testmu.auto@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestMu2024!',
  },

  timeouts: {
    default: Number(process.env.DEFAULT_TIMEOUT) || 30_000,
    action: Number(process.env.ACTION_TIMEOUT) || 10_000,
    short: 5_000,
    long: 60_000,
  },

  api: {
    retries: 3,
    retryDelay: 1_000,
    responseTimeThreshold: 3_000, // ms
  },
};
