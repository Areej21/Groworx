// StatusBadge renders a coloured pill based on the order status.
// Colours follow the spec: green=synced, amber=pending, red=failed.
import React from "react";
import type { Order } from "../services/api";

interface Props {
  status: Order["status"];
}

const STATUS_STYLES: Record<Order["status"], React.CSSProperties> = {
  synced: { backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  pending: { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fbbf24" },
  failed: { backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
};

export const StatusBadge: React.FC<Props> = ({ status }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "0.8rem",
      fontWeight: 600,
      textTransform: "capitalize",
      ...STATUS_STYLES[status],
    }}
  >
    {status}
  </span>
);
