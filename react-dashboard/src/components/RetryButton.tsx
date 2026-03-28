// RetryButton calls POST /orders/{id}/retry.
// Disabled while the request is in-flight to prevent double-submits.
// Shows an inline spinner while busy and success/error feedback after.
import React, { useState } from "react";
import { retryOrder } from "../services/api";
import type { Order } from "../services/api";

interface Props {
  order: Order;
  onRetrySuccess: (updated: Order) => void;
}

const Spinner = () => <span className="spinner" aria-hidden="true" />;

export const RetryButton: React.FC<Props> = ({ order, onRetrySuccess }) => {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  const handleRetry = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const updated = await retryOrder(order.id);
      setFeedback({ text: "Synced ✔", ok: true });
      onRetrySuccess(updated);
    } catch {
      setFeedback({ text: "Retry failed", ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
      <button
        className="btn btn-retry btn-sm"
        onClick={handleRetry}
        disabled={busy}
        aria-label={busy ? "Retrying order sync…" : "Retry failed order sync"}
        aria-busy={busy}
      >
        {busy && <Spinner />}
        {busy ? "Retrying…" : "Retry"}
      </button>
      {feedback && (
        <span
          className={`retry-feedback ${feedback.ok ? "retry-feedback-ok" : "retry-feedback-err"}`}
          role="status"
        >
          {feedback.text}
        </span>
      )}
    </div>
  );
};
