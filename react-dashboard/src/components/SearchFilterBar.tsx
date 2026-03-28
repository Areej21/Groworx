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

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="9" r="6" />
    <path d="M15 15l3 3" />
  </svg>
);

export const SearchFilterBar: React.FC<Props> = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => (
  <div className="toolbar">
    <div className="toolbar-left">
      <div className="toolbar-search-wrap">
        <span className="toolbar-search-icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          className="toolbar-input"
          placeholder="Search by order ID…"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search orders by ID"
        />
      </div>
      <select
        className="toolbar-select"
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="synced">Synced</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  </div>
);
