// OrdersTable renders the full list of orders as a responsive table.
// Retry button is shown only for failed orders.
import React from "react";
import type { Order } from "../services/api";
import { StatusBadge } from "./StatusBadge";
import { RetryButton } from "./RetryButton";

interface Props {
  orders: Order[];
  onRetrySuccess: (updated: Order) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export const OrdersTable: React.FC<Props> = ({ orders, onRetrySuccess }) => {
  if (orders.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 16px",
          color: "#6b7280",
          fontSize: "1rem",
        }}
      >
        No orders match your search. Try changing the filters.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f3f4f6",
              textAlign: "left",
            }}
          >
            {["Order ID", "Customer", "Total", "Status", "Received", "Action"].map(
              (heading) => (
                <th
                  key={heading}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "2px solid #d1d5db",
                    fontWeight: 600,
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr
              key={order.id}
              style={{
                backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600 }}>
                {order.order_id}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontWeight: 500 }}>{order.customer_name ?? "—"}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {order.customer_email}
                </div>
              </td>
              <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                {order.currency} {parseFloat(order.total).toFixed(2)}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <StatusBadge status={order.status} />
              </td>
              <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>
                {formatDate(order.received_at)}
              </td>
              <td style={{ padding: "12px 16px" }}>
                {order.status === "failed" ? (
                  <RetryButton order={order} onRetrySuccess={onRetrySuccess} />
                ) : (
                  <span style={{ color: "#d1d5db" }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
