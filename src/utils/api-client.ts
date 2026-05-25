import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../config/env.config';

export interface ApiClientOptions {
  token?: string;
}

/**
 * Reusable API client wrapping Playwright's request context
 * with retry logic, auth, and response-time tracking.
 */
export class ApiClient {
  private token: string | null = null;

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = '',
  ) {}

  // ── Auth ────────────────────────────────────────────────────
  async authenticate(email: string, password: string): Promise<string> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await this.post('/users/login', { email, password });
      const text = await res.text();
      if (res.status() === 200 && text) {
        const body = JSON.parse(text);
        this.token = body.token;
        return this.token!;
      }
      await this.delay(1_000 * attempt);
    }
    throw new Error('Authentication failed after 3 attempts');
  }

  setToken(token: string): void {
    this.token = token;
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // ── HTTP methods with retry ─────────────────────────────────
  async get(path: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.withRetry(() =>
      this.request.get(`${this.baseUrl}${path}`, {
        headers: this.authHeaders(),
        params,
      }),
    );
  }

  async post(path: string, data: unknown): Promise<APIResponse> {
    return this.withRetry(() =>
      this.request.post(`${this.baseUrl}${path}`, {
        headers: { ...this.authHeaders(), 'Content-Type': 'application/json' },
        data,
      }),
    );
  }

  async put(path: string, data: unknown): Promise<APIResponse> {
    return this.withRetry(() =>
      this.request.put(`${this.baseUrl}${path}`, {
        headers: { ...this.authHeaders(), 'Content-Type': 'application/json' },
        data,
      }),
    );
  }

  async patch(path: string, data: unknown): Promise<APIResponse> {
    return this.withRetry(() =>
      this.request.patch(`${this.baseUrl}${path}`, {
        headers: { ...this.authHeaders(), 'Content-Type': 'application/json' },
        data,
      }),
    );
  }

  async delete(path: string): Promise<APIResponse> {
    return this.withRetry(() =>
      this.request.delete(`${this.baseUrl}${path}`, {
        headers: this.authHeaders(),
      }),
    );
  }

  // ── Retry logic ─────────────────────────────────────────────
  private async withRetry(
    fn: () => Promise<APIResponse>,
    retries = config.api.retries,
  ): Promise<APIResponse> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const start = Date.now();
        const response = await fn();
        const elapsed = Date.now() - start;

        // Attach timing as a custom header-like property for assertions
        (response as any).__responseTime = elapsed;

        // Don't retry on client errors (4xx), only on 5xx / network
        if (response.status() >= 500 && attempt < retries) {
          await this.delay(config.api.retryDelay * attempt);
          continue;
        }
        return response;
      } catch (err) {
        lastError = err as Error;
        if (attempt < retries) {
          await this.delay(config.api.retryDelay * attempt);
        }
      }
    }
    throw lastError ?? new Error('Request failed after retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Helper to read response time stored by the retry wrapper */
export function getResponseTime(response: APIResponse): number {
  return (response as any).__responseTime ?? 0;
}
