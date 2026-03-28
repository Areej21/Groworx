// OrdersPage is the main page component.
// Responsibilities: fetch data, manage filter state, delegate rendering.
import React, { useState, useCallback } from "react";
import { useOrders } from "../hooks/useOrders";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { OrdersTable } from "../components/OrdersTable";
import { ErrorState } from "../components/ErrorState";
import type { Order } from "../services/api";

type StatusFilter = Order["status"] | "all";

const RefreshIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

function formatLastUpdated(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export const OrdersPage: React.FC = () => {
  const { orders, loading, error, lastUpdated, refetch } = useOrders();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // On retry success, refetch so the updated order status reflects immediately
  const handleRetrySuccess = useCallback(
    (_updated: Order) => { refetch(); },
    [refetch]
  );

  const filtered = orders.filter((o) => {
    const matchesSearch = o.order_id
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasFilters = searchText.trim() !== "" || statusFilter !== "all";

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Order Sync Dashboard</h1>
            <p className="page-subtitle">
              Monitor incoming orders and retry failed ERP syncs.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={refetch}
            disabled={loading}
            aria-label="Refresh orders now"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner — shown above the card so data context is still visible */}
      {!loading && error && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {/* Main content card */}
      {!error && (
        <div className="card">
          {/* Toolbar: search + filter, always visible even during load */}
          <SearchFilterBar
            searchText={searchText}
            onSearchChange={setSearchText}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* Results count + last-updated indicator */}
          {!loading && (
            <div className="results-bar">
              <span className="results-count">
                {filtered.length === orders.length
                  ? `${orders.length} order${orders.length !== 1 ? "s" : ""}`
                  : `${filtered.length} of ${orders.length} orders`}
              </span>
              {lastUpdated && (
                <span className="last-updated">
                  <span className="live-dot" aria-hidden="true" />
                  Updated {formatLastUpdated(lastUpdated)}
                </span>
              )}
            </div>
          )}

          {/* Table — shows skeleton while loading, data or empty state otherwise */}
          <OrdersTable
            orders={filtered}
            loading={loading}
            onRetrySuccess={handleRetrySuccess}
            hasFilters={hasFilters}
          />
        </div>
      )}
    </div>
  );
};
