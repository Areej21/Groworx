# Python API – Groworx Order Integration

FastAPI service that receives WooCommerce order webhooks, transforms them to ERP format, and stores them in SQLite.

## Quick Start

```bash
cd python-api
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API is available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

## Run Tests

```bash
cd python-api
pytest -v
```

## Smoke Test Commands

### Send a valid order webhook
```bash
curl -X POST http://localhost:8000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "WC-10042",
    "customer_email": "john@example.com",
    "customer_name": "John Doe",
    "line_items": [
      {"sku": "SHIRT-BLU-M", "quantity": 2, "unit_price": 29.99},
      {"sku": "JEANS-BLK-32", "quantity": 1, "unit_price": 59.99}
    ],
    "total": 119.97,
    "currency": "ZAR",
    "created_at": "2026-03-23T10:30:00Z"
  }'
```

### Send an invalid webhook (missing required field)
```bash
curl -X POST http://localhost:8000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{"order_id": "WC-BAD", "total": 10.0}'
```

### Fetch all orders
```bash
curl http://localhost:8000/orders
```

### Retry a failed order (replace 1 with actual order ID)
```bash
curl -X POST http://localhost:8000/orders/1/retry
```

## Assumptions

- ERP sync is simulated: the retry endpoint flips status to `synced`. In production this would call a real ERP API.
- Total mismatch tolerance is 2 cents to account for floating-point rounding.
- SQLite is used for local development; the `DATABASE_URL` env var can be set to use Postgres in production.
