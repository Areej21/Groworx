# PR Notes: feat/task-3-node-refactor → main

## Summary

Refactors AI-generated server.js into production-ready Express API.

## Changes

- `BUGS.md` — 10 real bugs identified and documented (cause, impact, fix)
- `src/app.js` — Express app configured (separated from server entry point)
- `src/server.js` — entry point only; calls app.listen
- `src/routes/orders.js` — route definitions
- `src/controllers/orderController.js` — request handlers
- `src/services/orderService.js` — in-memory store with _reset() for test isolation
- `src/validators/orderValidator.js` — pure validation and sanitisation functions
- `src/middleware/errorHandler.js` — central error handler
- `tests/validator.test.js` — 15 unit tests for validation logic
- `tests/orders.test.js` — 12 Supertest integration tests
- All 27 tests pass

## Key Decisions

- Port changed to 3001 to avoid conflict with React dev server on 3000
- `_reset()` on service enables isolated test runs
- In-memory storage kept intentionally — swappable service design documented
- `sanitiseOrder` extracts only whitelisted fields, discarding injection attempts

## Test Results

```
Tests: 27 passed, 2 suites
Time: 2.066s
```

## Merge Command

```bash
git checkout main
git merge --no-ff feat/task-3-node-refactor -m "merge: feat/task-3-node-refactor into main"
```
