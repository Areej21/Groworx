# FUNDAMENTALS_PREP.md – Interview Fundamentals

Short, clear answers to common technical questions. Read these the morning of your review.

---

## Git

**What is a branch?**
A branch is a separate line of development. It lets you work on a feature without affecting the main codebase. When it is ready, you merge it in. Think of it like a copy of the project that you can change safely.

**What is a commit?**
A commit is a saved snapshot of your changes. Each commit has a message describing what changed and why. Good commits are small and focused on one thing.

**What is a pull request (PR)?**
A PR is a proposal to merge your branch into another branch (usually main). It gives team members a chance to review the changes before they are merged. GitHub shows the diff, lets people leave comments, and tracks approvals.

**What is `git merge` vs `git rebase`?**
`merge` combines two branches and preserves the history of both. `rebase` rewrites your commits on top of another branch — cleaner history, but more dangerous on shared branches. For this project I used merge to keep history transparent.

**What is `git stash`?**
It temporarily saves uncommitted changes so you can switch branches. Useful when you need to work on something else urgently.

---

## HTTP

**What is the difference between GET, POST, PUT, and DELETE?**
- GET: read data, no body, idempotent
- POST: create new resource, has body, not idempotent
- PUT: replace an entire resource, idempotent
- PATCH: update part of a resource
- DELETE: remove a resource

**What do these status codes mean?**
- 200 OK — success, returning data
- 201 Created — success, new resource was created
- 400 Bad Request — client sent invalid data
- 401 Unauthorized — not authenticated
- 403 Forbidden — authenticated but not allowed
- 404 Not Found — resource does not exist
- 409 Conflict — request conflicts with current state (e.g. duplicate)
- 422 Unprocessable Entity — request is valid JSON but fails validation
- 500 Internal Server Error — something broke on the server

**Why do status codes matter?**
Clients use them to decide how to handle responses. Monitoring tools alert on 5xx errors. Load balancers route traffic based on health checks that use status codes. Returning 200 for errors hides problems.

---

## REST

**What is REST?**
REST is a design style for APIs. Key principles:
- Use HTTP methods correctly (GET for reading, POST for creating etc.)
- Resources are identified by URLs (/orders, /orders/1)
- Stateless — every request contains all information needed; server stores no session
- Consistent response format (usually JSON)

**What makes an API RESTful?**
- Clear resource URLs
- Correct HTTP verbs
- Meaningful status codes
- Stateless requests
- Consistent response shape

---

## CORS

**What is CORS?**
Cross-Origin Resource Sharing. Browsers block JavaScript from calling APIs on a different domain (for security). CORS is a set of HTTP headers that tell the browser it is allowed.

**Why did you add CORS to your Python API?**
The React app runs on `localhost:5173` and calls the API on `localhost:8000`. Those are different ports — the browser treats them as different origins. Without CORS middleware, the browser would block the request.

**How did you configure it?**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```
This allows requests from the React dev server. In production you would replace these with your actual domain.

---

## Clean Code

**What is clean code?**
Code that is easy to read, understand, and change. Key properties:
- Good names (functions and variables describe what they do)
- Small functions that do one thing
- No surprises (the function does what its name says)
- Consistent style
- Comments explain WHY, not WHAT

**What is DRY?**
Don't Repeat Yourself. If you write the same logic twice, extract it into a function. If you change the logic later, you only have to change it in one place.

---

## Separation of Concerns

**What does it mean?**
Each part of the code should have one clear responsibility. In this project:
- `schemas/` — what data looks like (validation)
- `models/` — how data is stored in the database
- `services/` — business logic (transform, save, retry)
- `api/` — HTTP layer (receive request, call service, return response)

**Why does it matter?**
If the business logic is mixed into the route handler, you can't test it without sending HTTP requests. If the database model is mixed into the schema, you can't change the API without changing the database. Separation makes every part independently testable and changeable.

---

## Debugging Approach

**How do you debug a failing test?**
1. Read the error message completely — it tells you the file, line, and what was expected vs actual
2. Add a print statement or debugger breakpoint at the failing point
3. Check your assumptions — is the input what you think it is?
4. Isolate the problem — does it fail with a simpler input?
5. Read the documentation for the function or library involved

**How do you debug a production issue?**
1. Check logs first — what error message or status code was returned?
2. Reproduce it locally with the same input
3. Add extra logging if needed
4. Check recent changes — git log shows what changed recently
5. Use the simplest fix that solves the root cause, not just the symptom

---

## When to Trust AI — and When Not To

**When AI is helpful:**
- Boilerplate and scaffolding (project structure, imports)
- Generating test cases for edge cases you might not think of
- Explaining unfamiliar APIs or libraries
- Speeding up repetitive code (writing multiple similar validators)

**When AI is not reliable:**
- Business logic that depends on your specific requirements
- Security-sensitive code (always review manually)
- When the AI hasn't been told your constraints and context
- Cross-cutting concerns (e.g. "make this production-ready" — too vague)

**How do you verify AI-generated code?**
Read it line by line. Run it. Write a test that would catch if it was wrong. If you cannot explain why a line is there, don't ship it.

---

## Learning Under Pressure

**How do you learn something new quickly?**
1. Find the official docs and the quickstart example
2. Build the smallest possible thing that works
3. Then add complexity one piece at a time
4. Test each step — don't add the next thing until the current thing works

**What do you do when you are completely stuck?**
1. Re-read the error message from the beginning
2. Search for the exact error message (in quotes) on the internet
3. Simplify the problem — remove things until it works, then add back
4. Read the source code of the library if needed
5. Take a 5-minute break — fresh eyes help
6. Ask a colleague (or AI) with a clear, specific question describing what you expected vs what happened
