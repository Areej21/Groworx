// StatusBadge renders a coloured pill based on the order status.
// Colours: green=synced, amber=pending, red=failed. Dot animates for pending.
import React from "react";
import type { Order } from "../services/api";

interface Props {
  status: Order["status"];
}

const BADGE_CLASS: Record<Order["status"], string> = {
  synced: "badge badge-synced",
  pending: "badge badge-pending",
  failed: "badge badge-failed",
};

export const StatusBadge: React.FC<Props> = ({ status }) => (
  <span className={BADGE_CLASS[status]}>
    <span className="badge-dot" aria-hidden="true" />
    {status}
  </span>
);
