import { eventTypes, products } from "@/lib/mock-data";
import type { AnalyticsEvent, EventType, KpiMetric } from "@/lib/types";

const eventLabels: Record<EventType, string> = {
  page_view: "Page Views",
  product_view: "Product Views",
  add_to_cart: "Add to Cart",
  checkout_started: "Checkout",
  purchase: "Purchase",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getKpis(events: AnalyticsEvent[]): KpiMetric[] {
  const activeUsers = new Set(events.map((event) => event.session_id)).size;
  const purchases = events.filter((event) => event.type === "purchase");
  const revenue = purchases.reduce((sum, event) => sum + (event.value ?? 0), 0);
  const productViews = events.filter((event) => event.type === "product_view").length;
  const conversionRate = productViews > 0 ? (purchases.length / productViews) * 100 : 0;

  return [
    {
      label: "Active users",
      value: String(activeUsers),
      trend: "weekly unique sessions",
      tone: "green",
    },
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      trend: `${purchases.length} orders`,
      tone: "blue",
    },
    {
      label: "Conversion rate",
      value: `${conversionRate.toFixed(1)}%`,
      trend: "view to purchase",
      tone: "amber",
    },
    {
      label: "Events/min",
      value: String(events.length),
      trend: "weekly event volume",
      tone: "rose",
    },
  ];
}

export function getRealtimeKpis(events: AnalyticsEvent[]): KpiMetric[] {
  const recentWindow = Date.now() - 60_000;
  const recentEvents = events.filter((event) => new Date(event.timestamp).getTime() >= recentWindow);
  const activeUsers = new Set(recentEvents.map((event) => event.session_id)).size;
  const purchases = events.filter((event) => event.type === "purchase");
  const revenue = purchases.reduce((sum, event) => sum + (event.value ?? 0), 0);
  const productViews = events.filter((event) => event.type === "product_view").length;
  const conversionRate = productViews > 0 ? (purchases.length / productViews) * 100 : 0;

  return [
    {
      label: "Active now",
      value: String(activeUsers),
      trend: "last 60 seconds",
      tone: "green",
    },
    {
      label: "Live revenue",
      value: formatCurrency(revenue),
      trend: `${purchases.length} orders in sample`,
      tone: "blue",
    },
    {
      label: "Conversion",
      value: `${conversionRate.toFixed(1)}%`,
      trend: "view to purchase",
      tone: "amber",
    },
    {
      label: "Events/min",
      value: String(recentEvents.length),
      trend: "stream velocity",
      tone: "rose",
    },
  ];
}

export function getDailySeries(events: AnalyticsEvent[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      revenue: 0,
      events: 0,
      purchases: 0,
    };
  });

  const dayMap = new Map(days.map((day) => [day.key, day]));

  events.forEach((event) => {
    const key = event.timestamp.slice(0, 10);
    const day = dayMap.get(key);

    if (!day) {
      return;
    }

    day.events += 1;

    if (event.type === "purchase") {
      day.purchases += 1;
      day.revenue += event.value ?? 0;
    }
  });

  return days;
}

export function getEventTypeBreakdown(events: AnalyticsEvent[]) {
  return eventTypes.map((type) => ({
    type,
    label: eventLabels[type],
    count: events.filter((event) => event.type === type).length,
  }));
}

export function getFunnel(events: AnalyticsEvent[]) {
  const counts = eventTypes.map((type) => ({
    type,
    label: eventLabels[type],
    count: events.filter((event) => event.type === type).length,
  }));
  const max = Math.max(...counts.map((item) => item.count), 1);

  return counts.map((item) => ({
    ...item,
    percentage: Math.max((item.count / max) * 100, 4),
  }));
}

export function getTopProducts(events: AnalyticsEvent[]) {
  return products
    .map((product) => {
      const productEvents = events.filter((event) => event.product_id === product.id);
      const purchases = productEvents.filter((event) => event.type === "purchase");

      return {
        ...product,
        views: productEvents.filter((event) => event.type === "product_view").length,
        purchases: purchases.length,
        revenue: purchases.reduce((sum, event) => sum + (event.value ?? 0), 0),
      };
    })
    .sort((a, b) => b.views + b.purchases * 2 - (a.views + a.purchases * 2))
    .slice(0, 4);
}

export function describeEvent(event: AnalyticsEvent) {
  const productName = event.meta?.product_name ?? event.product_id ?? "catalog";
  const messages: Record<EventType, string> = {
    page_view: "opened the storefront",
    product_view: `viewed ${productName}`,
    add_to_cart: `added ${productName} to cart`,
    checkout_started: `started checkout for ${productName}`,
    purchase: `purchased ${productName}`,
  };

  return messages[event.type];
}
