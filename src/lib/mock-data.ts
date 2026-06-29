import type { AnalyticsEvent, EventType, Product } from "@/lib/types";

export const products: Product[] = [
  { id: "prod_air", name: "Nimbus Runner", category: "Shoes", price: 128 },
  { id: "prod_pack", name: "Metro Carryall", category: "Bags", price: 84 },
  { id: "prod_watch", name: "Pulse Watch", category: "Wearables", price: 219 },
  { id: "prod_jacket", name: "Rain Shell", category: "Outerwear", price: 166 },
  { id: "prod_lamp", name: "Focus Lamp", category: "Home", price: 72 },
];

export const eventTypes: EventType[] = [
  "page_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "purchase",
];

const eventWeights: EventType[] = [
  "page_view",
  "page_view",
  "page_view",
  "product_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "purchase",
];

const sessions = Array.from({ length: 34 }, (_, index) => `user_${index + 11}`);

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function createMockEvent(): AnalyticsEvent {
  return createEventAt(new Date());
}

export function createEventAt(date: Date): AnalyticsEvent {
  const product = pick(products);
  const type = pick(eventWeights);

  return {
    id: crypto.randomUUID(),
    type,
    timestamp: date.toISOString(),
    session_id: pick(sessions),
    product_id: product.id,
    value: type === "purchase" ? product.price : undefined,
    meta: {
      product_name: product.name,
      category: product.category,
      channel: pick(["organic", "paid", "email", "social"]),
    },
  };
}

export function createInitialEvents(count = 36): AnalyticsEvent[] {
  return Array.from({ length: count }, (_, index) => {
    const event = createMockEvent();
    const secondsAgo = (count - index) * 12;

    return {
      ...event,
      timestamp: new Date(Date.now() - secondsAgo * 1000).toISOString(),
    };
  }).reverse();
}

export function createHistoricalEvents(days = 7): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  const start = new Date();
  start.setHours(9, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (let day = 0; day < days; day += 1) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + day);
    const dailyVolume = 92 + Math.floor(Math.random() * 54);

    for (let index = 0; index < dailyVolume; index += 1) {
      const eventTime = new Date(dayStart);
      eventTime.setMinutes(Math.floor(Math.random() * 720));
      events.push(createEventAt(eventTime));
    }
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
