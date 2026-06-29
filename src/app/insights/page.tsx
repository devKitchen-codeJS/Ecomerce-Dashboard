import { ArrowRight, BrainCircuit, FileText, LineChart, ShieldAlert, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

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

const recommendedActions = [
  "Review checkout exits for products with high cart volume.",
  "Compare paid and organic channels before adjusting spend.",
  "Prepare daily executive summary once Supabase history is connected.",
];

export default function InsightsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="AI insights"
            title="Business intelligence workspace"
            description="A base layout for generated summaries, conversion explanations, anomaly notes, and executive reports."
          />
          <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200">
            <Sparkles className="h-4 w-4" />
            Generate report
          </button>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">Insight modes</h2>
                <p className="mt-1 text-sm text-slate-500">Choose the type of analysis the AI endpoint will run.</p>
              </div>
              <Badge className="text-sky-300">Draft UI</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {insightModes.map((mode) => {
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.title}
                    className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-emerald-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">{mode.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-400">{mode.description}</span>
                    </span>
                    <ArrowRight className="mt-2 h-4 w-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">Generated report preview</h2>
                <p className="mt-1 text-sm text-slate-500">This area will render the response from `/api/ai/insights`.</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-black/15 p-5">
              <p className="text-sm font-semibold text-white">Short summary</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Revenue is stable across the current sample, with purchase intent concentrated around a few
                top products. The next useful AI step is comparing live stream behavior with stored weekly history.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-black/15 p-5">
              <p className="text-sm font-semibold text-white">Recommended actions</p>
              <ul className="mt-3 space-y-3">
                {recommendedActions.map((action) => (
                  <li key={action} className="flex gap-3 text-sm leading-6 text-slate-400">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
