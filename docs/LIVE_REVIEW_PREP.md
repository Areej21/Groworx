# LIVE_REVIEW_PREP.md – Live Code Review Preparation

Quick reference for the live review session. Read these before the call.

---

## Repo Structure Explanation (30 seconds)

Say: *"The repo is a monorepo with three independent projects: the Python API, the React dashboard, and the Node.js refactor. Each has its own README, dependencies, and tests. They share nothing at the code level — only the React app talks to the Python API over HTTP."*

Point out:
- `python-api/` — backend, FastAPI, SQLite
- `react-dashboard/` — frontend, React + TypeScript
- `node-refactor/` — standalone refactored Express API
- `docs/` — all supporting documentation
- `DECISIONS.md` — AI usage log (required by assessment)

---

## Architecture Decisions — Ready Answers

**Why FastAPI?**
FastAPI uses Python's type hints natively, generates automatic API docs, and has built-in Pydantic integration. It's production-used at scale (Netflix, Uber). It was the right fit for a typed, validated webhook receiver.

**Why SQLite?**
Zero setup for local development. The `DATABASE_URL` environment variable means you can swap to Postgres with one config change. The ORM layer means no SQL needs to change.

**Why not Redux in React?**
The state is simple: a list of orders, two filter strings. Adding Redux for that would be over-engineering. `useState` + a custom hook is the right tool.

**Why is the retry endpoint using integer `id` instead of `order_id`?**
Internal integer IDs are unambiguous, always unique, and don't need URL encoding. String IDs like "WC-10042" could have special characters. Using the internal `id` is a REST convention.

**Why simulate ERP sync on retry?**
No ERP system was provided in the spec. I made the pragmatic choice to simulate it (flip status to synced) and documented it clearly. In production I would call the real ERP API and handle its response codes.

---

## Git History and Branching Strategy — Ready Answers

**What branches did you use?**
```
main                      — stable, always working
feat/task-1-python-api    — Task 1 development
feat/task-2-react-dashboard — Task 2 development
feat/task-3-node-refactor — Task 3 development
docs/task-4-documentation — Task 4 docs
```

**How did you merge?**
Merged each feature branch into main after tests passed. Used `git merge --no-ff` to preserve branch history. PR-style notes are in `docs/pr-notes/`.

**Why small, frequent commits?**
Easier to review. If a bug is introduced, a small commit is easy to revert. A giant commit with 50 changed files is impossible to bisect.

---

## AI Usage — Ready Answers

**What was AI-assisted?**
- Initial project structure and boilerplate
- Pydantic schema drafts
- First pass of validator functions
- Test structure scaffolding
- Documentation templates

**What did you write/refactor yourself?**
- Total mismatch cross-field validator (AI missed this)
- Retry endpoint using integer ID (AI used string — I changed it)
- `mountedRef` pattern in `useOrders` to prevent state updates after unmount
- `sanitiseOrder` as a separate function
- All DECISIONS.md entries (AI cannot write honest personal reflections)
- Bug descriptions in BUGS.md (AI can identify but I verified each one)

**How do you know the AI didn't just make things up?**
I read every piece of code generated. If I couldn't explain a line, I didn't use it. I ran tests. Tests don't lie — 18 Python tests and 27 Node.js tests all pass.

---

## Unexpected Input Handling — Ready Answers

**What happens if someone sends an empty body?**
Pydantic raises a validation error for missing required fields. FastAPI catches it and returns a 422 with a clear error list. In Node.js, the validator checks `if (!body || typeof body !== 'object')` first.

**What happens with a negative total?**
Rejected at the Pydantic layer with a 422 explaining `total cannot be negative`.

**What happens if the total doesn't match line items?**
The `@model_validator` catches it after individual field validation passes. Returns 422 with the computed vs provided values in the error message.

**What happens if someone sends an extra field like `admin: true`?**
Pydantic v2 ignores extra fields by default. In Node.js, `sanitiseOrder` only picks whitelisted fields — extra fields are discarded.

---

## Live Extension Strategies

If asked to add a new feature live:

**"Add a filter by customer email"**
- In Python: already returns `customer_email` — just needs frontend filter
- In React: add another `useState` for emailFilter, add to the `filtered` array logic in `OrdersPage`

**"Add pagination to GET /orders"**
- Add `limit` and `offset` query params to the FastAPI route
- `db.query(Order).offset(offset).limit(limit).all()`
- Update frontend to pass page number

**"Make the retry endpoint log the sync attempt"**
- Add a `sync_log` table with `order_id`, `attempted_at`, `result`
- Call `db.add(SyncLog(...))` inside `retry_order()`

**"What if the ERP API is down?"**
- Catch the HTTP error in `retry_order()`
- Set `order.status = "failed"` instead of "synced"
- Return the updated order with the failure reason

---

## Staying Calm During Live Modifications

- Read the question out loud before touching the keyboard
- Say: "Let me trace through the code first" — shows you understand the codebase
- If you're adding a function: write the function signature and a comment first, then fill it in
- If something doesn't work: say "let me check the error message" and read it carefully
- It's fine to say "I would look at the docs for this specific method" — that's how real developers work
