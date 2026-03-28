// Search and filter bar. Controlled by parent via value + onChange props.
import React from "react";
import type { Order } from "../services/api";

type StatusFilter = Order["status"] | "all";

interface Props {
  searchText: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export const SearchFilterBar: React.FC<Props> = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "16px",
      alignItems: "center",
    }}
  >
    <input
      type="text"
      placeholder="Search by Order ID…"
      value={searchText}
      onChange={(e) => onSearchChange(e.target.value)}
      style={{
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "0.9rem",
        minWidth: "220px",
        flex: "1",
      }}
    />
    <select
      value={statusFilter}
      onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
      style={{
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "0.9rem",
        backgroundColor: "#fff",
        cursor: "pointer",
      }}
    >
      <option value="all">All statuses</option>
      <option value="pending">Pending</option>
      <option value="synced">Synced</option>
      <option value="failed">Failed</option>
    </select>
  </div>
);
