# VIDEO_OUTLINE.md – 15-Minute Presentation Guide

This is your script and talking guide. Read through it before recording. Speak naturally — you do not need to read word for word.

---

## Suggested Screen-Share Order

1. Open the terminal
2. Start the Python API → show it running
3. Open the browser → show the React dashboard with data
4. Open VS Code → walk through code structure
5. Show git log (git log --oneline)
6. Show test results (pytest, then npm test)

---

## Section 1: Approach (0:00 – 5:00)

### How I planned my time

- Split the 3 tasks roughly as: Python API first (it's the backend foundation), React second (it depends on the API), Node.js refactor last (it's independent)
- Python API took longest because Pydantic validation and SQLAlchemy setup needed care
- React went faster because I knew the exact shape of the API data
- Node.js refactor was systematic: read the bugs, list them, fix them one by one

### What the first 10 minutes looked like for a less familiar area

- For the Node.js task: I started by reading the original code carefully and writing the bugs list in BUGS.md BEFORE writing any code
- That gave me a clear checklist to work through, which made the refactor structured rather than random
- This approach also works when you don't know a language well — understand the problem before touching the keyboard

### One AI conversation example

- **Prompt I used:** "Here is a FastAPI route for receiving a webhook. Validate the incoming payload using Pydantic v2. The payload has order_id, customer_email, line_items (array), and total. Add a cross-field validator that checks the total matches the sum of line items within a 2-cent tolerance."
- **What was good about this prompt:** it was specific — I named the library version, named the fields, and described the business rule precisely
- **What I would ask differently:** I would also add "separate the transformation logic from the route handler" upfront, because the first draft had everything in one function

### Why this prompt approach works

- AI generates better code when you give it constraints and context
- Vague prompts ("build a webhook") produce vague code
- Specific prompts ("build a webhook with these exact fields and these validation rules") produce usable code

---

## Section 2: Architecture Walkthrough (5:00 – 10:00)

### Folder structure (show in VS Code)

```
/
  python-api/         — FastAPI backend, SQLite, pytest
  react-dashboard/    — React + TypeScript + Vite frontend
  node-refactor/      — Refactored Express API + Jest tests
  docs/               — VIDEO_OUTLINE, LIVE_REVIEW_PREP, etc.
  DECISIONS.md        — AI usage log
  README.md           — Full setup guide
```

Each project is self-contained. You can run any of them independently.

### End-to-end data flow (point at each file as you say it)

1. A WooCommerce store sends a **POST /webhooks/orders** with order data
2. FastAPI receives it → Pydantic validates it (`schemas/order.py`)
3. If valid → `order_service.py` transforms it to ERP format
4. The transformed order is stored in SQLite via SQLAlchemy (`models/order.py`)
5. React polls **GET /orders** every 30 seconds and displays the table
6. If an order shows "failed", the user clicks Retry
7. React calls **POST /orders/{id}/retry**
8. The API updates the status to "synced" and returns the updated order
9. React updates the table via a fresh fetch

### One piece of code I am proud of (show `schemas/order.py`)

```python
@model_validator(mode="after")
def total_must_match_line_items(self) -> "WebhookOrderIn":
    computed = sum(
        round(item.quantity * item.unit_price, 2) for item in self.line_items
    )
    if abs(computed - self.total) > 0.02:
        raise ValueError(
            f"total ({self.total}) does not match sum of line items ({computed:.2f})"
        )
    return self
```

- This validator runs after all individual field validators pass
- It catches real data integrity errors that a sender might make — like a rounding error or a manually edited total
- It uses `abs()` with a 2-cent tolerance to handle floating-point arithmetic imprecision
- It's clean, readable, and explains exactly why it fails

---

## Section 3: Honest Reflection (10:00 – 15:00)

### Hardest part

- The Python package installation on Python 3.14. Pinned version numbers in requirements.txt failed because wheels didn't exist yet. Switching to unpinned versions and letting pip resolve fixed it.
- This taught me: always test your requirements.txt in a fresh environment

### How I got unstuck

- Read the full error message carefully — pip told me exactly which package failed and why
- Removed version pins and let pip resolve compatible versions

### Weakest part of the submission

- The React dashboard has no automated tests (no React Testing Library). The build passes and manual testing works, but client-side unit tests would make the code more production-ready.
- The ERP sync is simulated. In a real system the retry would call a real ERP API.

### What would break first under real load

- The Python API uses SQLite — it handles reads fine but cannot scale to concurrent writes. Under high load, SQLite would serialize writes and create a bottleneck. The fix is straightforward: change the DATABASE_URL to Postgres.
- The Node.js refactor uses in-memory storage — data is lost on every restart. This is fine for a demo but would be the first thing replaced.

### What I would improve with 3 more hours

1. Add pagination to GET /orders (large datasets would crash the browser)
2. Add React Testing Library tests for at least the StatusBadge and RetryButton
3. Add a Docker Compose file so the full stack starts with one command
4. Add a real ERP mock (a simple Express server that returns success/failure) to make the retry flow more realistic
5. Add GitHub Actions CI to run tests on every push

### What I learned that was new

- Pydantic v2 `@model_validator(mode="after")` — I knew field validators but cross-field validators were new to me
- Python 3.14 wheel compatibility issues with newer Python versions
- The importance of separating `app.js` from `server.js` in Node.js for test isolation — previously I always put `app.listen` in the same file

---

## Quick Reminders Before Recording

- Speak slowly and clearly
- Show the terminal output for tests before the code — it proves it runs
- If something unexpected happens during the screen share, narrate what you are doing
- "Let me show you the Git history" — run `git log --oneline` and explain the branch structure
- End with: "The code is clean, tested, and ready for review. I'm happy to answer questions."
