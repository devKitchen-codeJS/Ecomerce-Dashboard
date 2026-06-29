import { AppShell } from "@/components/layout/app-shell";
import { LiveEventsRealtime } from "@/components/events/live-events-realtime";

export default function EventsPage() {
  return (
    <AppShell>
      <LiveEventsRealtime />
    </AppShell>
  );
}
