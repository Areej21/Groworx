// Custom hook that fetches orders and sets up a 5-second auto-refresh.
// Returns orders, loading state, refreshing state, error state, lastUpdated timestamp, and a manual refetch function.
// `loading` is true only on the very first fetch (shows skeleton).
// `refreshing` is true on every subsequent background fetch (shows spinner).
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchOrders } from "../services/api";
import type { Order } from "../services/api";

const REFRESH_INTERVAL_MS = 5_000;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Track whether the component is still mounted to avoid state updates after unmount
  const mountedRef = useRef(true);
  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    if (!mountedRef.current) return;
    if (isFirstLoad.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const data = await fetchOrders();
      if (mountedRef.current) {
        setOrders(data);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch {
      if (mountedRef.current) {
        setError("Failed to fetch orders. Is the API server running?");
      }
    } finally {
      if (mountedRef.current) {
        if (isFirstLoad.current) {
          setLoading(false);
          isFirstLoad.current = false;
        } else {
          setRefreshing(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    isFirstLoad.current = true;
    load();

    // Set up the auto-refresh interval and clean it up on unmount
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [load]);

  return { orders, loading, refreshing, error, lastUpdated, refetch: load };
}
