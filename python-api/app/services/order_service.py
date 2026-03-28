"""
Order transformation service.
Converts the incoming WooCommerce webhook payload into ERP format.
This logic is kept entirely separate from the route handlers.
"""
import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.order import Order
from app.schemas.order import WebhookOrderIn


def transform_to_erp(payload: WebhookOrderIn) -> dict:
    """
    Map the incoming webhook fields to the internal ERP format.
    Keeps field mapping in one place so changes are easy to find.
    """
    erp_items = [
        {
            "product_code": item.sku,
            "qty": item.quantity,
            "price": item.unit_price,
            "line_total": round(item.quantity * item.unit_price, 2),
        }
        for item in payload.line_items
    ]

    return {
        "erp_reference": f"POS-{payload.order_id}",
        "contact_email": payload.customer_email,
        "items": erp_items,
        "order_total": payload.total,
        "currency_code": payload.currency or "ZAR",
        "source_platform": "woocommerce",
        "received_at": datetime.now(timezone.utc).isoformat(),
    }


def create_order(db: Session, payload: WebhookOrderIn) -> Order:
    """
    Transform the payload and persist it to the database.
    Status starts as 'pending' because ERP sync has not happened yet.
    """
    erp_payload = transform_to_erp(payload)

    order = Order(
        order_id=payload.order_id,
        customer_email=payload.customer_email,
        customer_name=payload.customer_name,
        total=str(payload.total),
        currency=payload.currency or "ZAR",
        status="pending",
        original_payload=payload.model_dump_json(),
        transformed_payload=json.dumps(erp_payload),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_all_orders(db: Session) -> list[Order]:
    """Return all orders ordered by most recently received."""
    return db.query(Order).order_by(Order.received_at.desc()).all()


def get_order_by_id(db: Session, order_id: int) -> Order | None:
    """Fetch a single order by its internal primary key."""
    return db.query(Order).filter(Order.id == order_id).first()


def retry_order(db: Session, order: Order) -> Order:
    """
    Simulate retrying an ERP sync for a failed order.

    In a real system this would call the ERP API. Here we flip the
    status to 'synced' so the frontend can demonstrate the retry flow.
    This assumption is documented in README.md and DECISIONS.md.
    """
    order.status = "synced"
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order
