# Node.js Refactor – Production-Ready Order Validator

Refactored version of an AI-generated order validation API. See `BUGS.md` for a full list of issues found and fixed.

## Quick Start

```bash
cd node-refactor
npm install
npm start        # start server on port 3001
```

## Run Tests

```bash
npm test
```

## Project Structure

```
src/
  app.js                     # Express app (no listen — importable by tests)
  server.js                  # Entry point — calls app.listen
  routes/orders.js           # Route definitions
  controllers/orderController.js  # Request handlers
  services/orderService.js   # In-memory order store
  validators/orderValidator.js    # Pure validation functions
  middleware/errorHandler.js      # Central error handler
tests/
  validator.test.js          # Unit tests for validation logic
  orders.test.js             # Integration tests via Supertest
```

## Endpoints

| Method | Path          | Description                  |
|--------|---------------|------------------------------|
| POST   | /validate     | Validate and store an order  |
| GET    | /orders       | List all stored orders       |
| GET    | /orders/:id   | Get a single order by ID     |
| GET    | /health       | Health check                 |

## Key Improvements Over Original

- Correct HTTP status codes (201, 400, 404, 409, 500)
- Strict equality in duplicate check (`===`)
- Proper validation: type checks, empty array check, item-level validation
- Input sanitisation — only whitelisted fields stored
- Error-handling middleware catching all unhandled errors
- `app.js` separated from `server.js` for testability
- Centralised validation in dedicated validator module

## Notes

- Storage is in-memory for simplicity. Data is lost on restart.
  This is a known limitation documented in DECISIONS.md.
- To use a database, replace `orderService.js` only.
