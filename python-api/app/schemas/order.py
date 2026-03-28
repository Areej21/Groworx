"""
Pydantic schemas for request validation and response serialisation.
Keeping schemas separate from models enforces clean separation of concerns.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, field_validator, model_validator


# ── Incoming webhook payload schemas ──────────────────────────────────────────

class LineItemIn(BaseModel):
    sku: str
    quantity: int
    unit_price: float

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be a positive integer")
        return v

    @field_validator("unit_price")
    @classmethod
    def price_must_be_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("unit_price cannot be negative")
        return v

    @field_validator("sku")
    @classmethod
    def sku_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("sku cannot be blank")
        return v.strip()


class WebhookOrderIn(BaseModel):
    order_id: str
    customer_email: EmailStr
    customer_name: Optional[str] = None
    line_items: List[LineItemIn]
    total: float
    currency: Optional[str] = "ZAR"
    created_at: Optional[datetime] = None

    @field_validator("order_id")
    @classmethod
    def order_id_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("order_id cannot be blank")
        return v.strip()

    @field_validator("line_items")
    @classmethod
    def line_items_must_not_be_empty(cls, v: List[LineItemIn]) -> List[LineItemIn]:
        if not v:
            raise ValueError("line_items must not be empty")
        return v

    @field_validator("total")
    @classmethod
    def total_must_be_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("total cannot be negative")
        return v

    @model_validator(mode="after")
    def total_must_match_line_items(self) -> "WebhookOrderIn":
        """
        Sanity-check: computed total from line items must be within 1 cent of provided total.
        This catches data-entry mistakes in the sending system.
        """
        computed = sum(
            round(item.quantity * item.unit_price, 2) for item in self.line_items
        )
        if abs(computed - self.total) > 0.02:
            raise ValueError(
                f"total ({self.total}) does not match sum of line items ({computed:.2f})"
            )
        return self


# ── ERP line-item sub-schema ───────────────────────────────────────────────────

class ERPLineItem(BaseModel):
    product_code: str
    qty: int
    price: float
    line_total: float


# ── Stored order response schema ───────────────────────────────────────────────

class OrderOut(BaseModel):
    id: int
    order_id: str
    customer_email: str
    customer_name: Optional[str]
    total: str
    currency: str
    status: str
    transformed_payload: dict
    received_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_json(cls, order) -> "OrderOut":
        return cls(
            id=order.id,
            order_id=order.order_id,
            customer_email=order.customer_email,
            customer_name=order.customer_name,
            total=order.total,
            currency=order.currency,
            status=order.status,
            transformed_payload=order.transformed_dict(),
            received_at=order.received_at,
            updated_at=order.updated_at,
        )
