"""
Tests for the order webhook endpoint and related functionality.
"""

VALID_PAYLOAD = {
    "order_id": "WC-10042",
    "customer_email": "john@example.com",
    "customer_name": "John Doe",
    "line_items": [
        {"sku": "SHIRT-BLU-M", "quantity": 2, "unit_price": 29.99},
        {"sku": "JEANS-BLK-32", "quantity": 1, "unit_price": 59.99},
    ],
    "total": 119.97,
    "currency": "ZAR",
    "created_at": "2026-03-23T10:30:00Z",
}


# ── Webhook: happy path ────────────────────────────────────────────────────────

def test_valid_webhook_returns_201(client):
    response = client.post("/webhooks/orders", json=VALID_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["order_id"] == "WC-10042"
    assert data["status"] == "pending"
    assert data["transformed_payload"]["erp_reference"] == "POS-WC-10042"


def test_valid_webhook_stores_order(client):
    client.post("/webhooks/orders", json=VALID_PAYLOAD)
    response = client.get("/orders")
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) == 1
    assert orders[0]["order_id"] == "WC-10042"


# ── Webhook: duplicate order ───────────────────────────────────────────────────

def test_duplicate_order_returns_409(client):
    client.post("/webhooks/orders", json=VALID_PAYLOAD)
    response = client.post("/webhooks/orders", json=VALID_PAYLOAD)
    assert response.status_code == 409


# ── Webhook: missing required fields ──────────────────────────────────────────

def test_missing_order_id_returns_422(client):
    payload = {**VALID_PAYLOAD}
    del payload["order_id"]
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_missing_customer_email_returns_422(client):
    payload = {**VALID_PAYLOAD}
    del payload["customer_email"]
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_missing_line_items_returns_422(client):
    payload = {**VALID_PAYLOAD}
    del payload["line_items"]
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_missing_total_returns_422(client):
    payload = {**VALID_PAYLOAD}
    del payload["total"]
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


# ── Webhook: invalid line_items ────────────────────────────────────────────────

def test_empty_line_items_returns_422(client):
    payload = {**VALID_PAYLOAD, "line_items": []}
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_negative_quantity_returns_422(client):
    payload = {
        **VALID_PAYLOAD,
        "line_items": [{"sku": "SHIRT-BLU-M", "quantity": -1, "unit_price": 29.99}],
        "total": -29.99,
    }
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_negative_unit_price_returns_422(client):
    payload = {
        **VALID_PAYLOAD,
        "line_items": [{"sku": "SHIRT-BLU-M", "quantity": 1, "unit_price": -5.00}],
        "total": -5.00,
    }
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_invalid_email_returns_422(client):
    payload = {**VALID_PAYLOAD, "customer_email": "not-an-email"}
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


def test_total_mismatch_returns_422(client):
    """Total that doesn't match the sum of line items should be rejected."""
    payload = {**VALID_PAYLOAD, "total": 999.00}
    response = client.post("/webhooks/orders", json=payload)
    assert response.status_code == 422


# ── Webhook: malformed body ────────────────────────────────────────────────────

def test_malformed_json_returns_422(client):
    response = client.post(
        "/webhooks/orders",
        content=b"this is not json",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422


# ── GET /orders ────────────────────────────────────────────────────────────────

def test_get_orders_empty(client):
    response = client.get("/orders")
    assert response.status_code == 200
    assert response.json() == []


def test_get_orders_returns_all(client):
    client.post("/webhooks/orders", json=VALID_PAYLOAD)
    second = {**VALID_PAYLOAD, "order_id": "WC-10043", "total": 29.99,
              "line_items": [{"sku": "SHIRT-BLU-M", "quantity": 1, "unit_price": 29.99}]}
    client.post("/webhooks/orders", json=second)
    response = client.get("/orders")
    assert response.status_code == 200
    assert len(response.json()) == 2


# ── POST /orders/{id}/retry ───────────────────────────────────────────────────

def test_retry_nonexistent_order_returns_404(client):
    response = client.post("/orders/9999/retry")
    assert response.status_code == 404


def test_retry_pending_order_returns_409(client):
    """Pending orders should not be retried – only failed ones."""
    client.post("/webhooks/orders", json=VALID_PAYLOAD)
    orders = client.get("/orders").json()
    order_id = orders[0]["id"]
    response = client.post(f"/orders/{order_id}/retry")
    assert response.status_code == 409


def test_retry_failed_order_succeeds(client):
    """
    Insert an order manually set to 'failed', then retry it.
    We use the DB directly via conftest to set status.
    """
    from tests.conftest import TestingSessionLocal
    from app.models.order import Order
    import json

    erp = {"erp_reference": "POS-WC-FAIL", "contact_email": "x@x.com",
            "items": [], "order_total": 10.0, "currency_code": "ZAR",
            "source_platform": "woocommerce", "received_at": "2026-01-01T00:00:00"}
    db = TestingSessionLocal()
    order = Order(
        order_id="WC-FAIL-001",
        customer_email="fail@example.com",
        customer_name="Fail User",
        total="10.00",
        currency="ZAR",
        status="failed",
        original_payload=json.dumps({}),
        transformed_payload=json.dumps(erp),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()

    response = client.post(f"/orders/{order_id}/retry")
    assert response.status_code == 200
    assert response.json()["status"] == "synced"
