import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";
import type { AnalyticsEvent, EventType } from "@/lib/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type TypedSupabaseClient = SupabaseClient<Database>;

const eventTypes: EventType[] = ["page_view", "product_view", "add_to_cart", "checkout_started", "purchase"];

function isEventType(type: string): type is EventType {
  return eventTypes.includes(type as EventType);
}

function isEventRow(value: unknown): value is EventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.type === "string" &&
    typeof row.timestamp === "string" &&
    typeof row.session_id === "string"
  );
}

function getMeta(meta: Json): Record<string, string | number | boolean> {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(meta).filter((entry): entry is [string, string | number | boolean] => {
      const value = entry[1];

      return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
    }),
  );
}

export function eventRowToAnalyticsEvent(row: EventRow): AnalyticsEvent | null {
  if (!isEventType(row.type)) {
    return null;
  }

  return {
    id: row.id,
    organization_id: row.organization_id ?? undefined,
    store_id: row.store_id ?? undefined,
    type: row.type,
    timestamp: row.timestamp,
    session_id: row.session_id,
    product_id: row.product_id ?? undefined,
    value: row.value ?? undefined,
    meta: getMeta(row.meta),
  };
}

export function realtimePayloadToEvent(payload: { new: unknown }) {
  if (!isEventRow(payload.new)) {
    return null;
  }

  return eventRowToAnalyticsEvent(payload.new);
}

export function analyticsEventToInsert(event: AnalyticsEvent, organizationId?: string | null): EventInsert {
  return {
    id: event.id,
    organization_id: organizationId ?? event.organization_id ?? null,
    store_id: event.store_id ?? null,
    type: event.type,
    timestamp: event.timestamp,
    session_id: event.session_id,
    product_id: event.product_id ?? null,
    value: event.value ?? null,
    meta: event.meta ?? {},
  };
}

export async function getCurrentOrganizationId(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.organization_id ?? null;
}

export async function fetchRecentEvents(
  supabase: TypedSupabaseClient,
  options: {
    organizationId?: string | null;
    limit?: number;
    since?: string;
  } = {},
) {
  let query = supabase
    .from("events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(options.limit ?? 180);

  if (options.organizationId) {
    query = query.eq("organization_id", options.organizationId);
  }

  if (options.since) {
    query = query.gte("timestamp", options.since);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map(eventRowToAnalyticsEvent)
    .filter((event): event is AnalyticsEvent => Boolean(event));
}

export async function insertEvents(
  supabase: TypedSupabaseClient,
  events: AnalyticsEvent[],
  organizationId?: string | null,
) {
  if (events.length === 0) {
    return;
  }

  const rows = events.map((event) => analyticsEventToInsert(event, organizationId));
  const { error } = await supabase.from("events").insert(rows);

  if (error) {
    throw error;
  }
}

export function mergeEvents(currentEvents: AnalyticsEvent[], nextEvents: AnalyticsEvent[], limit = 180) {
  const eventMap = new Map<string, AnalyticsEvent>();

  [...nextEvents, ...currentEvents].forEach((event) => {
    eventMap.set(event.id, event);
  });

  return Array.from(eventMap.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
