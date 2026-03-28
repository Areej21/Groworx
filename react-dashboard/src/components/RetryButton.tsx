// RetryButton calls POST /orders/{id}/retry.
// Disabled while the request is in-flight to prevent double-submits.
// Only rendered for failed orders (parent is responsible for that check).
import React, { useState } from "react";
import { retryOrder } from "../services/api";
import type { Order } from "../services/api";

interface Props {
  order: Order;
  onRetrySuccess: (updated: Order) => void;
}

export const RetryButton: React.FC<Props> = ({ order, onRetrySuccess }) => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRetry = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await retryOrder(order.id);
      setMessage("Retry successful — order synced.");
      onRetrySuccess(updated);
    } catch {
      setMessage("Retry failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
      <button
        onClick={handleRetry}
        disabled={busy}
        style={{
          padding: "4px 12px",
          borderRadius: "6px",
          border: "1px solid #dc2626",
          backgroundColor: busy ? "#fee2e2" : "#dc2626",
          color: busy ? "#dc2626" : "#fff",
          cursor: busy ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: "0.8rem",
          transition: "background-color 0.2s",
        }}
      >
        {busy ? "Retrying…" : "Retry"}
      </button>
      {message && (
        <span
          style={{
            fontSize: "0.75rem",
            color: message.includes("successful") ? "#065f46" : "#991b1b",
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};
