# DECISIONS.md – AI Usage & Engineering Decisions

This document tracks every significant decision made during the Groworx Junior Developer Assessment, including how AI tools were used, what they got right, what I changed, and what I would do differently.

---

## Task 1: Python Webhook Receiver API

### AI Tools Used
- **Tool:** Claude (GitHub Copilot / Claude Sonnet)
- **What I asked it to do:**
  - Generate the FastAPI project structure following the specified folder layout
  - Write Pydantic schemas for the incoming webhook and ERP response
  - Draft the SQLAlchemy Order model with appropriate fields
  - Suggest validation rules for line items (total mismatch check, empty array check)
  - Generate pytest fixtures using an in-memory SQLite test database

### What the AI Got Right
- The separation of concerns structure (routes / models / schemas / services / db) was solid from the first draft
- Pydantic v2 field validators and `@model_validator` usage was accurate
- The `get_db` dependency injection pattern for SQLAlchemy sessions was correct
- The `check_same_thread=False` SQLite argument — easy to miss without experience

### What I Changed and Why
- Added a `@model_validator(mode="after")` to cross-check that `total` matches the sum of line items (within 2 cents). The AI initially omitted this important business rule.
- Changed the `retry` endpoint to use internal DB `id` (integer) rather than `order_id` (string). This is safer because integer IDs are predictable and less likely to collide or be confused. Documented as an explicit assumption.
- Added `order.status = "synced"` simulation to the retry endpoint with a clear comment. The AI originally left a TODO here.
- Removed a circular import issue in the initial `__init__.py` structure.
- Changed the `updated_at` field to use `onupdate` lambda properly — the AI used a string instead of a callable.

### What I Struggled With
- Python 3.14 was the installed version. Some pinned package versions in requirements.txt failed to install due to missing pre-built wheels. Fixed by unpinning versions and letting pip resolve.
- SQLAlchemy `onupdate` with timezone-aware datetimes needed care.
- Getting the Pydantic `model_dump_json()` serialisation to preserve datetime strings in the expected ISO format.

### What I Would Do Differently With More Time
- Add pagination to `GET /orders` (offset + limit query params)
- Add a background task or webhook retry queue (e.g. Celery) instead of simulating sync
- Add logging with structured JSON using Python's `logging` module
- Add a `POST /orders/{id}/fail` endpoint for testing (to set status to failed without manual DB manipulation)
- Use Alembic for database migrations instead of `create_all`

---

## Task 2: React Sync Dashboard

### AI Tools Used
- **Tool:** Claude (GitHub Copilot)
- **What I asked it to do:**
  - Scaffold the Vite + React + TypeScript component structure
  - Write the `useOrders` hook with auto-refresh and cleanup on unmount
  - Design the `OrdersTable`, `StatusBadge`, `RetryButton`, and `SearchFilterBar` components
  - Handle TypeScript `verbatimModuleSyntax` errors (type-only imports)

### What the AI Got Right
- The `useOrders` hook structure with `mountedRef` to avoid state updates after unmount was correct — this is a subtle and important pattern
- The axios API service layer abstraction (all API calls in one file) was clean
- TypeScript interfaces matching the exact backend response shape

### What I Changed and Why
- Fixed TS errors: unused imports, `import type` needed for `verbatimModuleSyntax` mode
- Removed the unused `React` import in App.tsx (new JSX transform doesn't need it)
- Changed `handleRetrySuccess` to call `refetch()` rather than doing local state mutation. It's safer and simpler: just re-fetch fresh data from the server rather than trying to merge updates into local state.
- Added the `_updated` prefix to the unused parameter to be TypeScript-honest about intentional ignoring

### What I Struggled With
- The Vite scaffolding auto-started the dev server interactively; had to work around that
- The Vite boilerplate `App.tsx` contained a lot of template code that needed careful surgical replacement
- `verbatimModuleSyntax` strict mode in newer Vite/TypeScript configs requires `import type` — not obvious from React docs

### What I Would Do Differently With More Time
- Add React Testing Library unit tests for components
- Add a toast notification system instead of inline text messages for retry results
- Add sorting to the orders table (click header to sort by column)
- Add date range filter
- Add a detail modal/drawer showing the full ERP transformed payload

---

## Task 3: Node.js AI-to-Production Refactor

### AI Tools Used
- **Tool:** Claude (GitHub Copilot)
- **What I asked it to do:**
  - Analyse the original server.js for bugs
  - Generate a production-ready refactored structure
  - Write Jest unit tests for the validator and Supertest integration tests

### What the AI Got Right
- Identified all 10 real bugs in the original code (status codes, loose equality, in-memory only, no 404, etc.)
- The separation into app.js / server.js for testability was immediately suggested and is the correct pattern
- The `_reset()` function on the service for test isolation was a good suggestion

### What I Changed and Why
- Added `sanitiseOrder()` as a separate function — the AI initially mixed sanitisation into the controller. Separating it makes it testable independently.
- Made the error handler log to `console.error` but hide stack traces in production via `NODE_ENV` check — AI initially leaked full error details always.
- Port changed to 3001 (instead of 3000) to avoid conflicts with React dev server.
- Added `findAll()` returning a copy (`[...orders]`) to prevent callers mutating internal state — subtle bug the AI version introduced.

### What I Struggled With
- The `console.error` in the error handler produces output during tests. Considered silencing it but decided to keep it because suppressing errors in tests can hide real problems. Documented this as expected behavior.
- Jest `--runInBand` was needed because the in-memory store is module-level state — parallel test runs would interfere.

### What I Would Do Differently With More Time
- Replace in-memory storage with a real database (SQLite or Postgres)
- Add request rate limiting (express-rate-limit)
- Add input length limits to prevent memory exhaustion
- Add JSON schema validation with Joi or Zod instead of manual checks

---

## Task 4: Git Discipline & Documentation

### AI Tools Used
- **Tool:** Claude
- **What I asked it to do:**
  - Generate commit message templates
  - Generate README, DECISIONS.md, VIDEO_OUTLINE.md, LIVE_REVIEW_PREP.md, FUNDAMENTALS_PREP.md

### What the AI Got Right
- Documentation structure and coverage
- Commit message discipline (imperative mood, descriptive scope)
- README structure with setup steps, architecture, and assumptions

### What I Changed and Why
- Added specific, honest notes to DECISIONS.md rather than generic AI-generated talking points
- Tailored the video outline to what was actually built, not a hypothetical project
- Made fundamentals answers shorter and more natural-sounding

### What I Struggled With
- Windows PowerShell's handling of multi-line strings made some file creation require workarounds
- Git branching workflow had to be simulated locally since no remote was set up initially

### What I Would Do Differently With More Time
- Set up GitHub Actions CI to run tests automatically on push
- Add a Docker Compose file so the full stack starts with one command
- Add pre-commit hooks (black for Python, eslint for JS)

---

## Cross-Cutting Decisions

### Why SQLite?
Simplest possible setup for local development. No external services needed. The DATABASE_URL env var makes it easy to swap for Postgres or MySQL in production without changing application code.

### Why simulate ERP sync on retry?
The assessment doesn't specify an ERP system. Simulating the sync as a status flip is honest and clearly documented. In a real project, this function would call the ERP API and handle its response codes.

### Why integer ID for retry endpoint?
Using the internal database ID (integer) in `POST /orders/{id}/retry` is cleaner than using `order_id` (string). It's unambiguous, avoids URL-encoding issues with strings like "WC-10042", and follows REST conventions.

### Why no heavy UI library in React?
The assessment explicitly says to prefer simple styling. Using inline styles and custom components keeps the bundle smaller, the code more readable, and avoids reviewers needing to know a specific library.
