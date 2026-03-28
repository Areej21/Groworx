# TEST_REPORT.md

Generated: 2026-03-28

This report documents the results of all automated tests and manual smoke tests performed before final submission.

---

## 1. Python API — pytest

**Command:** `cd python-api && python -m pytest tests/ -v`

**Results:**

```
platform win32 -- Python 3.14.3, pytest-9.0.2
collected 18 items

tests/test_orders.py::test_valid_webhook_returns_201            PASSED
tests/test_orders.py::test_valid_webhook_stores_order           PASSED
tests/test_orders.py::test_duplicate_order_returns_409          PASSED
tests/test_orders.py::test_missing_order_id_returns_422         PASSED
tests/test_orders.py::test_missing_customer_email_returns_422   PASSED
tests/test_orders.py::test_missing_line_items_returns_422       PASSED
tests/test_orders.py::test_missing_total_returns_422            PASSED
tests/test_orders.py::test_empty_line_items_returns_422         PASSED
tests/test_orders.py::test_negative_quantity_returns_422        PASSED
tests/test_orders.py::test_negative_unit_price_returns_422      PASSED
tests/test_orders.py::test_invalid_email_returns_422            PASSED
tests/test_orders.py::test_total_mismatch_returns_422           PASSED
tests/test_orders.py::test_malformed_json_returns_422           PASSED
tests/test_orders.py::test_get_orders_empty                     PASSED
tests/test_orders.py::test_get_orders_returns_all               PASSED
tests/test_orders.py::test_retry_nonexistent_order_returns_404  PASSED
tests/test_orders.py::test_retry_pending_order_returns_409      PASSED
tests/test_orders.py::test_retry_failed_order_succeeds          PASSED

18 passed in 0.93s
```

**Status: PASS — 18/18**

---

## 2. Python API — Manual Smoke Tests

API started with: `uvicorn app.main:app --port 8000`

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| GET /health | 200 `{"status":"ok"}` | 200 `{"status":"ok"}` | PASS |
| POST /webhooks/orders (valid) | 201, returns ERP payload | 201, `erp_reference: "POS-WC-SMOKE-001"` | PASS |
| GET /orders | 200, list with 1 order | 200, `[{order_id: "WC-SMOKE-001", status: "pending"}]` | PASS |
| POST /orders/1/retry (pending) | 409 conflict | 409 | PASS |
| POST /webhooks/orders (missing fields) | 422 validation error | 422 | PASS |

**Status: PASS — 5/5**

---

## 3. React Dashboard — Build Verification

**Command:** `cd react-dashboard && npm run build`

```
vite v8.0.3 building client environment for production...
✓ 73 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-DGNrK5qb.css    1.78 kB │ gzip:  0.81 kB
dist/assets/index-BAnd99uM.js   233.97 kB │ gzip: 76.31 kB
✓ built in 354ms
```

**TypeScript errors:** 0  
**Build warnings:** 0  
**Status: PASS**

---

## 4. React Dashboard — Manual Verification

With Python API running at port 8000 and React dev server at port 5173:

| Feature | Expected | Verified |
|---------|----------|---------|
| Orders table renders | Shows columns: Order ID, Customer, Total, Status, Received, Action | PASS |
| Loading state | Shows "Loading orders…" on first load | PASS |
| Error state | Shows red error banner when API unreachable | PASS (stopped API, confirmed message) |
| Empty state | Shows "No orders match..." when filters exclude all | PASS |
| Status badge: pending | Amber/yellow pill | PASS |
| Status badge: synced | Green pill | PASS |
| Status badge: failed | Red pill | PASS |
| Search by Order ID | Typing "SMOKE" filters to matching row | PASS |
| Status filter | Selecting "synced" hides pending orders | PASS |
| Retry button visibility | Only shows on failed orders | PASS |
| Retry button disabled | Greyed out during in-flight request | PASS |
| Auto-refresh | Orders table updates after 30s (verified by watching network tab) | PASS |
| CORS | No CORS errors in browser console | PASS |

**Status: PASS — 13/13**

---

## 5. Node.js Refactor — Jest Tests

**Command:** `cd node-refactor && npm test`

```
 PASS  tests/validator.test.js
 PASS  tests/orders.test.js

Test Suites: 2 passed, 2 total
Tests:       27 passed, 27 total
Time:        2.066s
```

Note: `console.error` output during the "malformed JSON" test is expected — the error handler logs all errors by design. The test still passes (400 status returned correctly).

**Status: PASS — 27/27**

---

## 6. Full-Stack Sanity

| Check | Result |
|-------|--------|
| React fetches from Python API | PASS — orders displayed correctly |
| CORS allows localhost:5173 | PASS — no browser console errors |
| Retry button calls POST /orders/{id}/retry | PASS — verified via network tab |
| No runtime errors in browser console | PASS |
| Python API server starts cleanly | PASS |
| Node.js server starts cleanly | PASS |

---

## 7. Documentation Sanity

| File | Status |
|------|--------|
| README.md | Complete — setup, architecture, smoke test commands |
| DECISIONS.md | Complete — 4 tasks with all required sections |
| BUGS.md | Complete — 10 real bugs documented |
| docs/VIDEO_OUTLINE.md | Complete — 15-minute script with screen-share order |
| docs/LIVE_REVIEW_PREP.md | Complete — ready answers for live review |
| docs/FUNDAMENTALS_PREP.md | Complete — all fundamentals covered |
| docs/TEST_REPORT.md | This file |
| docs/pr-notes/*.md | 3 PR notes (one per task) |

---

## Summary

| Component | Tests | Status |
|-----------|-------|--------|
| Python API (pytest) | 18/18 | PASS |
| Python API (smoke) | 5/5 | PASS |
| React Dashboard (build) | 0 errors | PASS |
| React Dashboard (manual) | 13/13 | PASS |
| Node.js refactor (Jest) | 27/27 | PASS |
| Full-stack integration | 6/6 | PASS |
| **TOTAL** | **69 checks** | **ALL PASS** |
