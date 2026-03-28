"""
Order routes – webhook receiver, order listing, and retry.
Route handlers stay thin: they validate input via Pydantic, delegate
all business logic to order_service, and return clean responses.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.order import OrderOut, WebhookOrderIn
from app.services.order_service import (
    create_order,
    get_all_orders,
    get_order_by_id,
    retry_order,
)

router = APIRouter()


@router.post(
    "/webhooks/orders",
    status_code=status.HTTP_201_CREATED,
    response_model=OrderOut,
    summary="Receive and store a WooCommerce order webhook",
)
def receive_webhook(payload: WebhookOrderIn, db: Session = Depends(get_db)):
    """
    Accept a WooCommerce-style order webhook, transform it to ERP format,
    and persist it. Returns 409 if the order_id already exists.
    """
    try:
        order = create_order(db, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Order '{payload.order_id}' already exists.",
        )
    return OrderOut.from_orm_with_json(order)


@router.get(
    "/orders",
    response_model=list[OrderOut],
    summary="List all stored orders",
)
def list_orders(db: Session = Depends(get_db)):
    """Return all orders sorted by most recently received."""
    orders = get_all_orders(db)
    return [OrderOut.from_orm_with_json(o) for o in orders]


@router.post(
    "/orders/{order_id}/retry",
    response_model=OrderOut,
    summary="Retry ERP sync for a failed order",
)
def retry_sync(order_id: int, db: Session = Depends(get_db)):
    """
    Retry the ERP sync for a failed order.
    Only 'failed' orders can be retried – returns 409 for any other status.
    Returns 404 if the order does not exist.
    """
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id={order_id} not found.",
        )
    if order.status != "failed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Order is '{order.status}', not 'failed'. Only failed orders can be retried.",
        )
    updated = retry_order(db, order)
    return OrderOut.from_orm_with_json(updated)
