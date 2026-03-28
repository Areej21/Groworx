// Central API configuration. Change BASE_URL here if the backend moves.
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export interface LineItem {
  product_code: string;
  qty: number;
  price: number;
  line_total: number;
}

export interface TransformedPayload {
  erp_reference: string;
  contact_email: string;
  items: LineItem[];
  order_total: number;
  currency_code: string;
  source_platform: string;
  received_at: string;
}

export interface Order {
  id: number;
  order_id: string;
  customer_email: string;
  customer_name: string | null;
  total: string;
  currency: string;
  status: "pending" | "synced" | "failed";
  transformed_payload: TransformedPayload;
  received_at: string;
  updated_at: string;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/orders");
  return data;
}

export async function retryOrder(id: number): Promise<Order> {
  const { data } = await api.post<Order>(`/orders/${id}/retry`);
  return data;
}
