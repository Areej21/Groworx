# Groworx Junior Developer Assessment

A simplified e-commerce integration service that syncs order data from WooCommerce into an ERP system. Built as a monorepo across three independent projects.

---

## Repo Structure

```
/
  README.md               — this file
  DECISIONS.md            — AI usage log (required by assessment)
  .gitignore
  docs/
    VIDEO_OUTLINE.md      — 15-minute presentation guide
    LIVE_REVIEW_PREP.md   — live code review preparation
    FUNDAMENTALS_PREP.md  — technical interview fundamentals
    TEST_REPORT.md        — full test results
    pr-notes/             — PR-style merge notes for each task
  python-api/             — Task 1: FastAPI webhook receiver
  react-dashboard/        — Task 2: React sync dashboard
  node-refactor/          — Task 3: Production-refactored Express API
```

---

## Quick Start — Full Stack

### 1. Python API (run this first)

```bash
cd python-api
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API runs at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 2. React Dashboard

```bash
cd react-dashboard
npm install
npm run dev
```

Dashboard runs at: http://localhost:5173

### 3. Node.js Refactor (independent — separate port)

```bash
cd node-refactor
npm install
npm start
```

Runs at: http://localhost:3001

---

## Running All Tests

### Python (pytest) — 18 tests

```bash
cd python-api
python -m venv venv && venv\Scripts\activate  # or source venv/bin/activate
pip install -r requirements.txt
pytest -v
```

### React (build verification)

```bash
cd react-dashboard
npm install
npm run build
```

### Node.js (Jest + Supertest) — 27 tests

```bash
cd node-refactor
npm install
npm test
```

---

## Architecture Overview

### Data Flow

```
WooCommerce → POST /webhooks/orders
             ↓
         Pydantic validation (schemas/order.py)
             ↓
         Transform to ERP format (services/order_service.py)
             ↓
         Store in SQLite (models/order.py via SQLAlchemy)
             ↓
         React polls GET /orders every 30s
             ↓
         User clicks Retry → POST /orders/{id}/retry
             ↓
         Status updated to "synced"
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Python API | FastAPI, SQLAlchemy, Pydantic v2, SQLite |
| Testing (Python) | pytest, httpx (TestClient) |
| React dashboard | React 18, TypeScript, Vite, axios |
| Node.js refactor | Express 4, Jest, Supertest |

---

## Design Decisions

**SQLite for development:** Zero-setup persistence. Swap `DATABASE_URL` env var for Postgres in production — no other code changes needed.

**ERP sync simulated on retry:** No ERP system provided in the spec. The retry endpoint flips status to "synced". In production this would call a real ERP API. This is documented in DECISIONS.md.

**Integer ID for retry endpoint:** `POST /orders/{id}/retry` uses the internal integer primary key, not the string `order_id`. This avoids URL encoding issues and is unambiguous.

**No heavy UI library:** The React dashboard uses inline styles only. This keeps the bundle small and the component code readable without requiring knowledge of any specific design system.

**Port 3001 for Node.js:** Avoids conflicts with React dev server (3000) and Python API (8000).

**`app.js` separated from `server.js` in Node.js:** Allows tests (Supertest) to import the Express app without binding to a port.

---

## Assumptions

1. ERP sync is simulated. The retry endpoint marks orders as "synced" without calling a real ERP API.
2. Total mismatch tolerance is 2 cents to handle floating-point arithmetic imprecision.
3. The `POST /orders/{id}/retry` endpoint uses the database integer `id`, not the order string ID.
4. Only `failed` orders can be retried. Attempting to retry a `pending` or `synced` order returns 409.
5. The Node.js refactor keeps in-memory storage by design (documented limitation).

---

## Smoke Test Commands

### Send a valid webhook

```bash
curl -X POST http://localhost:8000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{"order_id":"WC-10042","customer_email":"john@example.com","customer_name":"John Doe","line_items":[{"sku":"SHIRT-BLU-M","quantity":2,"unit_price":29.99},{"sku":"JEANS-BLK-32","quantity":1,"unit_price":59.99}],"total":119.97,"currency":"ZAR","created_at":"2026-03-23T10:30:00Z"}'
```

### Fetch all orders

```bash
curl http://localhost:8000/orders
```

### Retry a failed order (set status to failed first if needed)

```bash
curl -X POST http://localhost:8000/orders/1/retry
```

### Test Node.js refactor

```bash
curl -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d '{"order_id":"ORD-001","items":[{"sku":"HAT-RED","quantity":2,"price":19.99}],"total":39.98}'
```

---

## Git Workflow

Three feature branches, one docs branch, all merged into main:

```
main
├── feat/task-1-python-api
├── feat/task-2-react-dashboard
├── feat/task-3-node-refactor
└── docs/task-4-documentation
```

PR-style merge notes are in `docs/pr-notes/`.

---

## Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/groworx-assessment.git
git push -u origin main
```
