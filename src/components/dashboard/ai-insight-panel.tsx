import Link from "next/link";
import { BrainCircuit, Lightbulb, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnalyticsEvent } from "@/lib/types";

type AiInsightPanelProps = {
  events: AnalyticsEvent[];
};

export function AiInsightPanel({ events }: AiInsightPanelProps) {
  const purchases = events.filter((event) => event.type === "purchase").length;
  const checkoutStarted = events.filter((event) => event.type === "checkout_started").length;
  const checkoutGap = Math.max(checkoutStarted - purchases, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">AI business pulse</h2>
          <p className="mt-1 text-sm text-slate-500">Powered by the /api/ai/insights endpoint</p>
        </div>
        <Badge className="gap-1.5 text-emerald-300">
          <BrainCircuit className="h-3.5 w-3.5" />
          Live
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-sm leading-6 text-slate-300">
              Traffic is active and purchase events are flowing. Current cart activity suggests shoppers are
              moving beyond browsing and showing buying intent.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-slate-300">
              Watch checkout completion: {checkoutGap} sessions reached checkout without a matching purchase in
              the visible sample.
            </p>
          </div>
        </div>
        <Link
          href="/insights"
          className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200"
        >
          Generate AI report
        </Link>
      </div>
    </Card>
  );
}
