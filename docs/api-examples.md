# API Request Examples

## POST /webhooks/orders

Accepts a JSON order payload, validates it, transforms it to ERP format, and stores it.

- **Success:** `201 Created`
- **Validation error:** `422 Unprocessable Entity`

---
    {
      "order_id": "WC-1001",
      "customer_email": "jane@example.com",
      "customer_name": "Jane Smith",
      "total": 49.99,
      "currency": "GBP",
      "line_items": [
        {
          "sku": "SKU-001",
          "quantity": 1,
          "unit_price": 49.99
        }
      ]
    }

### Valid order — single item

```json
```

---

### Valid order — multiple items

```json
{
  "order_id": "WC-1002",
  "customer_email": "bob@example.com",
  "customer_name": "Bob Jones",
  "total": 149.97,
  "currency": "USD",
  "line_items": [
    {
      "sku": "SKU-001",
      "quantity": 2,
      "unit_price": 49.99
    },
    {
      "sku": "SKU-002",
      "quantity": 1,
      "unit_price": 49.99
    }
  ]
}
```

---

### Invalid order — total mismatch (triggers 422)

```json
{
  "order_id": "WC-BAD",
  "customer_email": "bad@example.com",
  "customer_name": "Bad Actor",
  "total": 999.00,
  "currency": "GBP",
  "line_items": [
    {
      "sku": "SKU-001",
      "quantity": 1,
      "unit_price": 10.00
    }
  ]
}
```

---

## Validation rules

| Field | Rule |
|---|---|
| `order_id` | Required, non-empty string |
| `customer_email` | Required, valid email format |
| `total` | Required, positive number (float) |
| `currency` | Optional, defaults to `"ZAR"` |
| `line_items` | Required, at least one item |
| `line_items[].sku` | Required, non-empty string |
| `line_items[].quantity` | Required, positive integer |
| `line_items[].unit_price` | Required, non-negative float |
| `sum(quantity × unit_price) = total` | Order-level check, 2-cent tolerance |

---

## Other endpoints

### GET /orders

Returns all stored orders.

```
GET http://localhost:8000/orders
```

---

### POST /orders/{id}/retry

Retries ERP sync for a **failed** order. Returns `409` if the order is not in `failed` status.

```
POST http://localhost:8000/orders/1/retry
```

---

## curl quick-start

```bash
# Submit a valid order
curl -X POST http://localhost:8000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "WC-1001",
    "customer_email": "jane@example.com",
    "customer_name": "Jane Smith",
    "total": 49.99,
    "currency": "GBP",
    "line_items": [{"sku": "SKU-001", "quantity": 1, "unit_price": 49.99}]
  }'

# List all orders
curl http://localhost:8000/orders

# Retry a failed order (replace 1 with the actual order id)
curl -X POST http://localhost:8000/orders/1/retry
```

## PowerShell quick-start

```powershell
$body = @{
  order_id       = "WC-1001"
  customer_email = "jane@example.com"
  customer_name  = "Jane Smith"
  total          = 49.99
  currency       = "GBP"
  line_items     = @(
    @{ sku = "SKU-001"; quantity = 1; unit_price = 49.99 }
  )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/webhooks/orders" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```
