// OrdersTable renders the full list of orders in a clean, responsive table.
// Delegates skeleton loading, empty state, and retry action to dedicated components.
import React from "react";
import type { Order } from "../services/api";
import { StatusBadge } from "./StatusBadge";
import { RetryButton } from "./RetryButton";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface Props {
  orders: Order[];
  loading: boolean;
  onRetrySuccess: (updated: Order) => void;
  hasFilters: boolean;
}

const COLUMNS = ["Order ID", "Customer", "Total", "Status", "Received", "Action"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const OrdersTable: React.FC<Props> = ({
  orders,
  loading,
  onRetrySuccess,
  hasFilters,
}) => (
  <div className="table-wrap animate-in">
    <table className="orders-table" aria-label="Orders list">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col} scope="col">{col}</th>
          ))}
        </tr>
      </thead>

      {loading ? (
        <LoadingState />
      ) : orders.length === 0 ? (
        <tbody>
          <tr>
            <td colSpan={COLUMNS.length} style={{ padding: 0, border: "none" }}>
              <EmptyState hasFilters={hasFilters} />
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="cell-order-id">{order.order_id}</td>
              <td>
                <div className="cell-customer-name">{order.customer_name ?? "—"}</div>
                <div className="cell-customer-email">{order.customer_email}</div>
              </td>
              <td className="cell-total">
                <span className="cell-currency">{order.currency}</span>
                {parseFloat(order.total).toFixed(2)}
              </td>
              <td><StatusBadge status={order.status} /></td>
              <td className="cell-date">{formatDate(order.received_at)}</td>
              <td>
                {order.status === "failed" ? (
                  <RetryButton order={order} onRetrySuccess={onRetrySuccess} />
                ) : (
                  <span className="cell-dash">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  </div>
);
