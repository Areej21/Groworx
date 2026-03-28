# PR Notes: feat/task-1-python-api → main

## Summary

Implements the complete Python webhook receiver API for the Groworx Junior Developer Assessment.

## Changes

- Created `python-api/` project structure (app/, models/, schemas/, services/, db/)
- Implemented `POST /webhooks/orders` — validates payload, transforms to ERP format, stores in SQLite
- Implemented `GET /orders` — returns all stored orders for the React dashboard
- Implemented `POST /orders/{id}/retry` — updates failed orders to synced status
- Added CORS middleware allowing React dev server (port 5173)
- Added 18 pytest tests covering all happy paths and error cases
- All 18 tests pass

## Key Decisions

- Used integer `id` for retry endpoint instead of string `order_id` (cleaner, no URL encoding issues)
- Total mismatch validator (≤2 cent tolerance) added to catch data integrity errors
- ERP sync is simulated on retry — documented assumption in README and DECISIONS.md
- SQLite used for dev; DATABASE_URL env var allows production swap to Postgres

## Test Results

```
18 passed in 1.22s
```

## Merge Command

```bash
git checkout main
git merge --no-ff feat/task-1-python-api -m "merge: feat/task-1-python-api into main"
```
