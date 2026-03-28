// Custom hook that fetches orders and sets up a 30-second auto-refresh.
// Returns orders, loading state, error state, and a manual refetch function.
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchOrders } from "../services/api";
import type { Order } from "../services/api";

const REFRESH_INTERVAL_MS = 30_000;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track whether the component is still mounted to avoid state updates after unmount
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders();
      if (mountedRef.current) {
        setOrders(data);
        setError(null);
      }
    } catch {
      if (mountedRef.current) {
        setError("Failed to fetch orders. Is the API server running?");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();

    // Set up the auto-refresh interval and clean it up on unmount
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [load]);

  return { orders, loading, error, refetch: load };
}
