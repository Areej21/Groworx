"""
SQLAlchemy ORM model for the orders table.
Stores both the raw incoming payload and the transformed ERP payload.
"""
import json
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text
from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_name = Column(String, nullable=True)
    total = Column(String, nullable=False)   # stored as string to avoid float precision issues
    currency = Column(String, nullable=False, default="ZAR")
    status = Column(String, nullable=False, default="pending")  # pending | synced | failed

    # Full JSON payloads stored as TEXT
    original_payload = Column(Text, nullable=False)
    transformed_payload = Column(Text, nullable=False)

    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def original_dict(self) -> dict:
        return json.loads(self.original_payload)

    def transformed_dict(self) -> dict:
        return json.loads(self.transformed_payload)
