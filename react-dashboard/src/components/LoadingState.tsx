// LoadingState renders skeleton rows while orders are being fetched.
// Shown only on the initial page load, not during background refreshes.
import React from "react";

// Each skeleton row varies slightly to look natural
const ROW_CONFIGS = [
    { id: 60, name: 45, email: 30 },
    { id: 50, name: 55, email: 40 },
    { id: 65, name: 40, email: 35 },
    { id: 55, name: 50, email: 28 },
    { id: 58, name: 48, email: 33 },
];

const SkeletonRow: React.FC<{ id: number; name: number; email: number }> = ({
    id, name, email,
}) => (
    <tr>
        <td><div className="skeleton-bar" style={{ width: `${id}px` }} /></td>
        <td>
            <div className="skeleton-bar" style={{ width: `${name}%`, marginBottom: 6 }} />
            <div className="skeleton-bar" style={{ width: `${email}%`, height: 9 }} />
        </td>
        <td><div className="skeleton-bar" style={{ width: 56 }} /></td>
        <td><div className="skeleton-bar" style={{ width: 64, borderRadius: 9999 }} /></td>
        <td><div className="skeleton-bar" style={{ width: 90 }} /></td>
        <td><div className="skeleton-bar" style={{ width: 46 }} /></td>
    </tr>
);

export const LoadingState: React.FC = () => (
    <tbody className="skeleton-tbody" aria-label="Loading orders" aria-busy="true">
        {ROW_CONFIGS.map((cfg, i) => (
            <SkeletonRow key={i} {...cfg} />
        ))}
    </tbody>
);
