/**
 * Integration tests for the order API endpoints using Supertest.
 * These test the full HTTP layer without binding to a port.
 */
const request = require("supertest");
const app = require("../src/app");
const orderService = require("../src/services/orderService");

const VALID_ORDER = {
  order_id: "ORD-TEST-001",
  items: [{ sku: "HAT-RED-M", quantity: 1, price: 19.99 }],
  total: 19.99,
};

beforeEach(() => {
  // Reset in-memory store before each test for isolation
  orderService._reset();
});

// ── POST /validate ─────────────────────────────────────────────────────────────

describe("POST /validate", () => {
  test("accepts valid order and returns 201", async () => {
    const res = await request(app).post("/validate").send(VALID_ORDER);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("ok");
    expect(res.body.order.order_id).toBe("ORD-TEST-001");
  });

  test("returns 400 for missing order_id", async () => {
    const { order_id, ...body } = VALID_ORDER;
    const res = await request(app).post("/validate").send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("returns 400 for empty items array", async () => {
    const res = await request(app).post("/validate").send({ ...VALID_ORDER, items: [] });
    expect(res.status).toBe(400);
  });

  test("returns 400 for negative total", async () => {
    const res = await request(app).post("/validate").send({ ...VALID_ORDER, total: -50 });
    expect(res.status).toBe(400);
  });

  test("returns 409 for duplicate order_id", async () => {
    await request(app).post("/validate").send(VALID_ORDER);
    const res = await request(app).post("/validate").send(VALID_ORDER);
    expect(res.status).toBe(409);
  });

  test("returns 400 for no body / non-JSON body", async () => {
    const res = await request(app)
      .post("/validate")
      .set("Content-Type", "application/json")
      .send("not valid json");
    expect(res.status).toBe(400);
  });
});

// ── GET /orders ────────────────────────────────────────────────────────────────

describe("GET /orders", () => {
  test("returns empty array when no orders", async () => {
    const res = await request(app).get("/orders");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns stored orders after POST", async () => {
    await request(app).post("/validate").send(VALID_ORDER);
    const res = await request(app).get("/orders");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});

// ── GET /orders/:id ────────────────────────────────────────────────────────────

describe("GET /orders/:id", () => {
  test("returns 404 for unknown order", async () => {
    const res = await request(app).get("/orders/NOT-EXIST");
    expect(res.status).toBe(404);
  });

  test("returns correct order when found", async () => {
    await request(app).post("/validate").send(VALID_ORDER);
    const res = await request(app).get("/orders/ORD-TEST-001");
    expect(res.status).toBe(200);
    expect(res.body.order_id).toBe("ORD-TEST-001");
  });
});
