"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Download,
  FileText,
  LineChart,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { buildInsightContext, getFallbackInsightReport, type InsightContext, type InsightReport } from "@/lib/insights";
import { downloadInsightReportPdf } from "@/lib/pdf-report";
import { fetchRecentEvents, getCurrentOrganizationId } from "@/lib/events-store";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AnalyticsEvent } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

const insightModes = [
  {
    title: "Business summary",
    description: "Summarize what happened across recent revenue, product interest, and customer actions.",
    icon: FileText,
  },
  {
    title: "Conversion analysis",
    description: "Explain where users slow down between product views, carts, checkout, and purchase.",
    icon: LineChart,
  },
  {
    title: "Anomaly detection",
    description: "Flag unusual drops, spikes, or mismatches in event volume and purchase behavior.",
    icon: ShieldAlert,
  },
];

export default function InsightsPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string>();

  const [report, setReport] = useState<InsightReport>();
  const [context, setContext] = useState<InsightContext>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>();
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isActive = true;
    const userId = user.id;

    async function loadWeeklyEvents() {
      try {
        setIsLoadingEvents(true);
        setEventsError(undefined);
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 6);
        sinceDate.setHours(0, 0, 0, 0);

        const organizationId = await getCurrentOrganizationId(supabase, userId);
        const weeklyEvents = await fetchRecentEvents(supabase, {
          organizationId,
          since: sinceDate.toISOString(),
          limit: 5_000,
        });

        if (!isActive) {
          return;
        }

        setEvents(weeklyEvents);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setEventsError(error instanceof Error ? error.message : "Unable to load persisted weekly events.");
      } finally {
        if (isActive) {
          setIsLoadingEvents(false);
        }
      }
    }

    loadWeeklyEvents();

    return () => {
      isActive = false;
    };
  }, [supabase, user?.id]);

  const handleGenerate = useCallback(async () => {
    if (events.length === 0 || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenerateError(undefined);
    setUsedFallback(false);

    const builtContext = buildInsightContext(events, "Last 7 days");

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: builtContext }),
      });

      const data = (await response.json()) as { report?: InsightReport; error?: string };

      if (!response.ok || !data.report) {
        throw new Error(data.error || "Failed to generate the AI report.");
      }

      setReport(data.report);
      setContext(builtContext);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Unable to reach the AI service.");
      setReport(getFallbackInsightReport(builtContext));
      setContext(builtContext);
      setUsedFallback(true);
    } finally {
      setIsGenerating(false);
    }
  }, [events, isGenerating]);

  const handleDownload = useCallback(() => {
    if (!report || !context) {
      return;
    }

    downloadInsightReportPdf(report, context);
  }, [report, context]);

  const generateDisabled = isLoadingEvents || isGenerating || events.length === 0;

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="AI insights"
            title="Business intelligence workspace"
            description="Generates an executive report from the last 7 days of persisted Supabase events, then lets you download it as a PDF."
          />
          <button
            onClick={handleGenerate}
            disabled={generateDisabled}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate report"}
          </button>
        </section>

        {eventsError ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-4 w-4" />
            {eventsError}
          </div>
        ) : null}

        {!isLoadingEvents && events.length === 0 && !eventsError ? (
          <Card className="p-5">
            <p className="text-sm font-semibold text-white">No persisted events yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Open Live Events for a minute to generate and save events into Supabase, then come back here to
              generate a report.
            </p>
          </Card>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">Insight modes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  The report below covers all three at once: summary, conversion read, and anomalies.
                </p>
              </div>
              <Badge className="text-sky-300">
                {isLoadingEvents ? "Loading" : `${events.length} events`}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              {insightModes.map((mode) => {
                const Icon = mode.icon;

                return (
                  <div
                    key={mode.title}
                    className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-emerald-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">{mode.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-400">{mode.description}</span>
                    </span>
                    <ArrowRight className="mt-2 h-4 w-4 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <BrainCircuit className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">Generated report</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {report ? report.title : "Response from `/api/ai/insights` will appear here."}
                  </p>
                </div>
              </div>
              {report ? (
                <button
                  onClick={handleDownload}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
              ) : null}
            </div>

            {generateError ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {usedFallback
                  ? `AI request failed (${generateError}). Showing a metrics-based summary instead.`
                  : generateError}
              </div>
            ) : null}

            {!report ? (
              <div className="mt-6 rounded-lg border border-dashed border-white/10 bg-black/15 p-5 text-sm leading-6 text-slate-500">
                Click &ldquo;Generate report&rdquo; to analyze the last 7 days of persisted events and produce an
                executive summary, insights, recommended actions, and anomalies.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-white/10 bg-black/15 p-5">
                  <p className="text-sm font-semibold text-white">Summary</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{report.summary}</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/15 p-5">
                  <p className="text-sm font-semibold text-white">Key insights</p>
                  <ul className="mt-3 space-y-3">
                    {report.insights.map((insight) => (
                      <li key={insight} className="flex gap-3 text-sm leading-6 text-slate-400">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/15 p-5">
                  <p className="text-sm font-semibold text-white">Recommended actions</p>
                  <ul className="mt-3 space-y-3">
                    {report.recommendedActions.map((action) => (
                      <li key={action} className="flex gap-3 text-sm leading-6 text-slate-400">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {report.anomalies.length > 0 ? (
                  <div className="rounded-lg border border-white/10 bg-black/15 p-5">
                    <p className="text-sm font-semibold text-white">Anomalies</p>
                    <ul className="mt-3 space-y-3">
                      {report.anomalies.map((anomaly) => (
                        <li key={anomaly} className="flex gap-3 text-sm leading-6 text-slate-400">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                          {anomaly}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
