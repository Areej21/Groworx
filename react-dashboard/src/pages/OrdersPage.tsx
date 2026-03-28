// OrdersPage is the main page component.
// Responsibilities: fetch data, manage filter state, delegate rendering.
import React, { useState, useCallback } from "react";
import { useOrders } from "../hooks/useOrders";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { OrdersTable } from "../components/OrdersTable";
import type { Order } from "../services/api";

type StatusFilter = Order["status"] | "all";

export const OrdersPage: React.FC = () => {
  const { orders, loading, error, refetch } = useOrders();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // When a retry succeeds, update the matching order in local state immediately
  // so the user sees the change without waiting for the next auto-refresh.
  const handleRetrySuccess = useCallback((_updated: Order) => {
    refetch();
  }, [refetch]);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.order_id
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#111827" }}>
            Order Sync Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
            Auto-refreshes every 30 seconds
          </p>
        </div>
        <button
          onClick={refetch}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #3b82f6",
            backgroundColor: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Refresh Now
        </button>
      </div>

      {/* Filters */}
      <SearchFilterBar
        searchText={searchText}
        onSearchChange={setSearchText}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Content states */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            color: "#6b7280",
            fontSize: "1rem",
          }}
        >
          Loading orders…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              marginBottom: "12px",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            Showing {filtered.length} of {orders.length} orders
          </div>
          <OrdersTable orders={filtered} onRetrySuccess={handleRetrySuccess} />
        </>
      )}
    </div>
  );
};
