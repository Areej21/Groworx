// EmptyState is shown when the orders list is empty.
// hasFilters distinguishes between "no orders at all" vs "no results for current filters".
import React from "react";

interface Props {
    hasFilters: boolean;
}

export const EmptyState: React.FC<Props> = ({ hasFilters }) => (
    <div className="empty-state">
        <div className="empty-icon-wrap" aria-hidden="true">
            {hasFilters ? "🔍" : "📋"}
        </div>
        <div className="empty-title">
            {hasFilters ? "No matching orders" : "No orders yet"}
        </div>
        <p className="empty-body">
            {hasFilters
                ? "No orders match your current filters. Try clearing the search or changing the status filter."
                : "Orders will appear here as soon as the ERP integration starts receiving data."}
        </p>
    </div>
);
