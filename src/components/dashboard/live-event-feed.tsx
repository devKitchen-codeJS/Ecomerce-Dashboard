import { ShoppingCart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { describeEvent } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

type LiveEventFeedProps = {
  events: AnalyticsEvent[];
};

export function LiveEventFeed({ events }: LiveEventFeedProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Live event feed</h2>
          <p className="mt-1 text-sm text-slate-500">Latest simulated customer actions</p>
        </div>
        <Badge className="gap-1.5 text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          Live
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        {events.slice(0, 9).map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black/15 px-3 py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/5 text-slate-300">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">
                <span className="font-medium text-white">{event.session_id}</span> {describeEvent(event)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(event.timestamp))}
              </p>
            </div>
            <Badge>{event.type}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
