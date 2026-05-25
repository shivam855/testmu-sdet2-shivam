# Test Strategy

## Scope & Approach

### Application Under Test
[Contact List App](https://thinking-tester-contact-list.herokuapp.com) — a web-based CRUD app with authentication, contact management, and a REST API.

### Testing Layers

| Layer | What We Test | Why |
|---|---|---|
| **API (fastest)** | Auth endpoints, CRUD operations, error codes, schema contracts, response times | Fastest feedback; catches backend regressions before UI tests even run. |
| **UI (mid-speed)** | Login flow, dashboard, form validation, cross-browser rendering | Validates the user-facing experience and browser-specific quirks. |
| **Integration (slowest)** | Create via API → verify in UI; delete via API → verify in UI | Proves the full stack works end-to-end — the glue between layers. |

### What We Chose to Cover

1. **Authentication** — login success/failure, token handling, unauthenticated access → highest risk area.
2. **CRUD lifecycle** — create, read, update, delete contacts both via API and UI → core business flow.
3. **Validation** — form rejections for missing/invalid data → prevents bad data entering the system.
4. **Cross-browser** — chromium, firefox, webkit → ensures broad user coverage.
5. **Schema contracts** — JSON Schema validation on API responses → catches API drift.
6. **Performance** — response-time assertions on API calls → catches degradation early.

### What We'd Cover Next

- **Concurrent user sessions** — test token isolation
- **Pagination / large data sets** — stress test with 1000+ contacts
- **Accessibility** — screen reader and keyboard navigation
- **Negative security** — SQL injection, XSS in form fields
- **Visual regression** — screenshot diffing for UI consistency

## Data-Driven Approach

Test data lives in `src/test-data/*.json` and is consumed by parameterised tests:
- `users.json` — valid and invalid login credentials
- `contacts.json` — valid and invalid contact payloads
- `schemas.json` — JSON Schemas for API contract validation

This separation means:
- Data can be swapped per environment without code changes
- New test scenarios = add a JSON entry, not a new test function
- CI can override data via environment variables

## Flakiness Mitigation

| Strategy | Implementation |
|---|---|
| Auto-retry on failure | `retries: 2` in CI config |
| API retry with backoff | `ApiClient.withRetry()` — 3 attempts, exponential delay |
| Playwright auto-waits | Built-in — no manual `sleep()` calls |
| Isolated test data | Unique timestamps in names, API cleanup in tests |
| Stable selectors | `#id` selectors matching the app's DOM, no brittle XPath |

## Top 3 Risks

1. **Test environment instability** — The Heroku-hosted app may be slow or down. *Mitigation:* API retry logic, generous timeouts, CI retries.

2. **Shared test data** — Multiple CI runs or developers can interfere with each other's contacts. *Mitigation:* Unique timestamps in test data, cleanup after each test. *Next step:* per-run user provisioning.

3. **Selector fragility** — If the app's DOM changes (no `data-testid` attributes), our `#id` selectors break. *Mitigation:* Centralised in POM — one fix per page, not per test. *Next step:* advocate for `data-testid` attributes with the dev team.

## Test Pyramid Distribution

```
         ╱╲
        ╱ E2E ╲          ← 2 integration tests (slow, high-confidence)
       ╱────────╲
      ╱  UI Tests  ╲     ← ~12 UI tests (medium speed)
     ╱──────────────╲
    ╱   API Tests     ╲   ← ~15 API tests (fast, high volume)
   ╱────────────────────╲
```

We follow the testing pyramid: most tests at the API layer for speed and reliability, fewer at UI, and minimal but critical integration tests.
