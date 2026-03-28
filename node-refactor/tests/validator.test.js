/**
 * Unit tests for the order validator (pure functions).
 * No server needed — these test business logic in isolation.
 */
const { validateOrder, validateItem } = require("../src/validators/orderValidator");

const VALID_ORDER = {
  order_id: "ORD-001",
  items: [{ sku: "SHOE-BLK-10", quantity: 2, price: 49.99 }],
  total: 99.98,
};

// ── validateOrder: valid input ────────────────────────────────────────────────

describe("validateOrder – valid cases", () => {
  test("returns no errors for a valid order", () => {
    expect(validateOrder(VALID_ORDER)).toEqual([]);
  });

  test("accepts a total of zero", () => {
    const order = { ...VALID_ORDER, total: 0, items: [{ sku: "X", quantity: 1, price: 0 }] };
    expect(validateOrder(order)).toEqual([]);
  });
});

// ── validateOrder: invalid input ──────────────────────────────────────────────

describe("validateOrder – missing fields", () => {
  test("returns error when order_id is missing", () => {
    const { order_id, ...rest } = VALID_ORDER;
    const errors = validateOrder(rest);
    expect(errors.some((e) => e.includes("order_id"))).toBe(true);
  });

  test("returns error when items is missing", () => {
    const { items, ...rest } = VALID_ORDER;
    const errors = validateOrder(rest);
    expect(errors.some((e) => e.includes("items"))).toBe(true);
  });

  test("returns error when total is missing", () => {
    const { total, ...rest } = VALID_ORDER;
    const errors = validateOrder(rest);
    expect(errors.some((e) => e.includes("total"))).toBe(true);
  });

  test("returns error for empty items array", () => {
    const errors = validateOrder({ ...VALID_ORDER, items: [] });
    expect(errors.some((e) => e.includes("empty"))).toBe(true);
  });

  test("returns error for negative total", () => {
    const errors = validateOrder({ ...VALID_ORDER, total: -1 });
    expect(errors.some((e) => e.includes("negative"))).toBe(true);
  });

  test("returns error for non-numeric total", () => {
    const errors = validateOrder({ ...VALID_ORDER, total: "not-a-number" });
    expect(errors.some((e) => e.includes("total must be a number"))).toBe(true);
  });

  test("returns error for blank order_id string", () => {
    const errors = validateOrder({ ...VALID_ORDER, order_id: "   " });
    expect(errors.some((e) => e.includes("order_id"))).toBe(true);
  });

  test("returns error when body is null", () => {
    const errors = validateOrder(null);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("returns error when body is not an object", () => {
    const errors = validateOrder("a string");
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ── validateItem ──────────────────────────────────────────────────────────────

describe("validateItem", () => {
  test("returns no errors for a valid item", () => {
    expect(validateItem({ sku: "X", quantity: 1, price: 10 }, 0)).toEqual([]);
  });

  test("returns error for missing sku", () => {
    const errors = validateItem({ quantity: 1, price: 10 }, 0);
    expect(errors.some((e) => e.includes("sku"))).toBe(true);
  });

  test("returns error for zero quantity", () => {
    const errors = validateItem({ sku: "X", quantity: 0, price: 10 }, 0);
    expect(errors.some((e) => e.includes("quantity"))).toBe(true);
  });

  test("returns error for negative quantity", () => {
    const errors = validateItem({ sku: "X", quantity: -1, price: 10 }, 0);
    expect(errors.some((e) => e.includes("quantity"))).toBe(true);
  });

  test("returns error for non-integer quantity", () => {
    const errors = validateItem({ sku: "X", quantity: 1.5, price: 10 }, 0);
    expect(errors.some((e) => e.includes("quantity"))).toBe(true);
  });

  test("returns error for negative price", () => {
    const errors = validateItem({ sku: "X", quantity: 1, price: -5 }, 0);
    expect(errors.some((e) => e.includes("price"))).toBe(true);
  });
});
