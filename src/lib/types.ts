export type EventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "purchase";

export type AnalyticsEvent = {
  id: string;
  organization_id?: string;
  store_id?: string;
  type: EventType;
  timestamp: string;
  session_id: string;
  product_id?: string;
  value?: number;
  meta?: Record<string, string | number | boolean>;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export type KpiMetric = {
  label: string;
  value: string;
  trend: string;
  tone: "green" | "blue" | "amber" | "rose";
};
