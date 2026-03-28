"""
FastAPI application entry point.
Creates the app, registers CORS middleware, mounts routers,
and sets up the database tables on startup.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.db.session import engine
from app.models import Order  # noqa: F401 – import ensures model is registered
from app.db.session import Base
from app.api.orders import router as orders_router

# Create all tables on startup (safe to run even if tables already exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Groworx Order Integration API",
    description="Receives WooCommerce order webhooks, transforms them to ERP format, and stores them.",
    version="1.0.0",
)

# Allow the React dev server (port 5173) and any production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all order-related routes
app.include_router(orders_router, tags=["orders"])


@app.get("/health", tags=["health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


@app.exception_handler(ValidationError)
async def pydantic_validation_handler(request: Request, exc: ValidationError):
    """
    Catch Pydantic validation errors that escape route-level handling
    and return them as clean 422 responses.
    """
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
