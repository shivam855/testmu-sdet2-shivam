# TestMu SDET-2 Challenge — Test Automation Framework

> A production-grade Playwright + TypeScript test framework covering UI, API, and integration tests for the [Contact List App](https://thinking-tester-contact-list.herokuapp.com).

---

## Architecture Overview

```
testmu-sdet2-shivam/
├── .github/workflows/    # CI/CD pipeline (GitHub Actions)
│   └── test-ci.yml
├── src/
│   ├── config/           # Environment & runtime configuration
│   │   └── env.config.ts
│   ├── pages/            # Page Object Model (POM)
│   │   ├── base.page.ts          # Abstract base with shared helpers
│   │   ├── login.page.ts
│   │   ├── contact-list.page.ts
│   │   ├── add-contact.page.ts
│   │   ├── contact-details.page.ts
│   │   └── index.ts              # Barrel export
│   ├── test-data/        # Externalised data (JSON)
│   │   ├── users.json
│   │   ├── contacts.json
│   │   └── schemas.json          # JSON Schemas for API validation
│   └── utils/            # Reusable utilities
│       ├── api-client.ts         # HTTP wrapper with retry & timing
│       ├── schema-validator.ts   # AJV-based schema validation
│       └── test-fixtures.ts      # Custom Playwright fixtures
├── tests/
│   ├── ui/               # UI / browser tests
│   │   ├── login.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── form-validation.spec.ts
│   │   └── cross-browser-smoke.spec.ts
│   ├── api/              # API tests
│   │   ├── auth.api.spec.ts
│   │   └── contacts.api.spec.ts
│   └── integration/      # Combined API+UI flows
│       └── api-ui.integration.spec.ts
├── reports/              # Generated reports (gitignored)
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── test-strategy.md
├── ai-usage-log.md
└── README.md
```

## Design Decisions

| Decision | Rationale |
|---|---|
| **Playwright + TypeScript** | First-class multi-browser support, auto-waits, built-in API testing, strong TS types, native parallelism. |
| **Page Object Model** | Encapsulates selectors and page interactions; new engineers extend without touching tests. |
| **Custom fixtures** | Injects page objects and API clients via Playwright's fixture system — zero boilerplate per test. |
| **Externalised test data (JSON)** | Enables data-driven / parameterised tests; swap data per environment without code changes. |
| **API client with retry** | Handles flaky network calls; exponential back-off on 5xx; tracks response time for perf assertions. |
| **AJV schema validation** | Contract testing — catches API drift early without brittle field-by-field assertions. |
| **GitHub Actions CI with sharding** | Parallel browser runs (chromium/firefox/webkit × 2 shards) cut feedback time; artifacts preserve reports. |

## Setup & Run

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install
```bash
git clone https://github.com/<your-user>/testmu-sdet2-shivam.git
cd testmu-sdet2-shivam
npm install
npx playwright install --with-deps
```

### Configure
Copy `.env.example` to `.env` and fill in test credentials:
```bash
cp .env.example .env
```

### Run Tests
```bash
# All tests
npm test

# By category
npm run test:ui
npm run test:api
npm run test:integration
npm run test:smoke

# Specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Headed / debug mode
npm run test:headed
npm run test:debug
```

### View Reports
```bash
# Playwright HTML report
npm run report

# Allure report (requires allure CLI)
npm run report:allure
```

## CI/CD Pipeline (Option A)

**Why Option A over Option B:** A CI pipeline delivers immediate value — it catches regressions on every push and ensures no code merges without passing tests. A dashboard is useful but secondary; you need reliable execution before you can trend results. The pipeline also demonstrates real infrastructure skills.

The pipeline (`.github/workflows/test-ci.yml`):
1. Runs **API tests** first (fast feedback).
2. Runs **UI tests** sharded across 3 browsers × 2 shards (6 parallel jobs).
3. Runs **integration tests** after API tests pass.
4. **Merges reports** and publishes as downloadable artifacts.
5. **Notifies** via GitHub Step Summary on failure.

## What I'd Build Next (With More Time)

1. **Visual regression testing** — Playwright screenshot comparison for critical pages.
2. **Test analytics dashboard** — Track flaky tests, pass/fail trends, slowest tests across runs.
3. **Database seeding** — Proper test isolation with API-driven setup/teardown.
4. **Accessibility tests** — Axe-core integration via `@axe-core/playwright`.
5. **Performance budgets** — Lighthouse CI for Core Web Vitals.
6. **Slack/Teams notifications** — Webhook integration in CI for richer failure alerts.
7. **Docker-based execution** — Containerised test runs for environment consistency.
