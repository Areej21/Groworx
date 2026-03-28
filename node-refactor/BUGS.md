# Bugs Found in the Original AI-Generated server.js

This document lists every real production issue found in the original code,
why each one matters, and how it was fixed.

---

## Bug 1: No HTTP status codes — every response returns 200

**Original code:**
```js
res.send({ status: 'ok', message: 'Order validated and stored' });
res.send({ status: 'error', errors: errors });
```

**Why it matters:**
HTTP clients (browsers, API gateways, monitoring tools) rely on status codes to determine whether a request succeeded. Always returning 200 means error handling code in clients never fires. Load balancers mark unhealthy targets by status code; a 200 for every error hides failures.

**Fix:**
Use `res.status(201).json(...)` for created resources, `res.status(400).json(...)` for validation errors, `res.status(404)` for missing resources, and `res.status(409)` for duplicates.

---

## Bug 2: No 404 response for missing orders

**Original code:**
```js
app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.order_id == req.params.id);
  res.send(order);  // sends undefined if not found
});
```

**Why it matters:**
`res.send(undefined)` sends an empty body with status 200. The client has no way to tell the difference between "order not found" and "order exists but is empty". This makes debugging impossible and breaks any client code that expects JSON.

**Fix:**
```js
if (!order) return res.status(404).json({ error: 'Order not found' });
```

---

## Bug 3: Loose equality (==) in the duplicate check

**Original code:**
```js
if (orders[i].order_id == order.order_id) { ... }
```

**Why it matters:**
JavaScript's `==` performs type coercion. `"123" == 123` is `true`. An order_id sent as the number `10` would match an existing order_id stored as the string `"10"`, silently treating them as duplicates. In production this could block valid orders from being processed.

**Fix:**
Use strict equality `===` everywhere.

---

## Bug 4: In-memory storage — all data is lost on restart

**Original code:**
```js
let orders = [];
```

**Why it matters:**
Every server restart wipes all order data. In production this means order history and any in-flight processing is lost the moment the process is killed, updated, or crashes. This is not a valid persistence strategy.

**Fix:**
In this refactor, in-memory storage is intentionally kept for simplicity (as documented in README), but the service layer is extracted so that swapping in a database requires changing only one file. This design decision is documented in DECISIONS.md.

---

## Bug 5: Weak validation — only checks for truthy values, ignores types

**Original code:**
```js
if (!order.items) { valid = false; errors.push('missing items'); }
if (order.total < 0) { valid = false; errors.push('negative total'); }
```

**Why it matters:**
`!order.items` is `true` for `0`, `false`, `""`, and `null` — but it passes for an empty array `[]`, which creates an order with no items. There is no type check on `total`, so passing `"abc"` would silently store a string and the `< 0` check would evaluate to `false` (no error), storing garbage data.

**Fix:**
Validate types explicitly and check `Array.isArray` for arrays, plus verify the array is non-empty.

---

## Bug 6: No validation on individual line items / items array contents

**Original code:**
The validator checks if `order.items` exists but never inspects its contents.

**Why it matters:**
Malformed items (missing `sku`, zero/negative quantities, missing prices) reach the storage layer and corrupt the data. Downstream ERP systems can crash or behave unpredictably on invalid item data.

**Fix:**
The `validateOrder` function validates each item: checks for `sku`, positive `quantity`, and non-negative `price`.

---

## Bug 7: No error handling middleware — unhandled exceptions crash or leak details

**Original code:**
No `try/catch` blocks and no Express error handler registered.

**Why it matters:**
Any unexpected runtime error (e.g. `.find` on undefined, JSON parsing edge case) will cause Express to either crash the process or return a raw HTML error page with a stack trace, leaking internal implementation details to callers — a security risk.

**Fix:**
A centralised `errorHandler` middleware is added in `src/middleware/errorHandler.js`. All routes are wrapped in try/catch and call `next(err)` on failure.

---

## Bug 8: `app.listen` is called directly in the application file

**Original code:**
```js
app.listen(3000, () => console.log('running'));
```

**Why it matters:**
Calling `app.listen` in the same file that defines the app makes it impossible to import the app in tests without starting a real server. This forces tests to bind to a port, causing port-conflict failures in CI environments and making tests slower and flakier.

**Fix:**
The app is defined in `src/app.js` and listen is called separately in `src/server.js`. Tests import `app.js` directly and use Supertest's in-process server, no port binding required.

---

## Bug 9: No input sanitisation — raw user input stored and echoed back

**Original code:**
The entire `req.body` object is pushed directly into the array and returned without any sanitisation.

**Why it matters:**
If the stored data is later rendered in a web interface without escaping, injected scripts will execute (stored XSS). Extra fields injected by callers (e.g. `__proto__`, `constructor`) could pollute the object prototype.

**Fix:**
Only explicitly whitelisted fields are extracted from `req.body` before storing. Any extra keys are discarded.

---

## Bug 10: No protection against missing or malformed Content-Type

**Original code:**
No check on the request Content-Type header. `express.json()` will simply skip parsing if the header is wrong, leaving `req.body` as `undefined`.

**Why it matters:**
If `req.body` is `undefined`, `order.order_id` throws a `TypeError: Cannot read properties of undefined`, crashing the route handler.

**Fix:**
The validator checks that `req.body` is a non-null object before accessing any property. The error handler also catches any uncaught TypeError.
