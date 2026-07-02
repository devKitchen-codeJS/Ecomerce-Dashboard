"use client";

import { ArrowRight, BarChart3, BrainCircuit, RadioTower, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

export default function HomePage() {
  const router = useRouter();
  const { isLoading, session } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, session]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <RadioTower className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">Realtime Commerce AI</span>
              <span className="block text-xs text-slate-500">Analytics cockpit</span>
            </span>
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">SaaS analytics MVP</Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              AI-ready analytics for realtime commerce teams
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Track weekly performance, watch live events, and prepare business summaries from a single clean
              dashboard built for e-commerce operations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-surface-900 transition hover:bg-slate-200"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
              >
                Sign in
              </Link>
            </div>
          </div>

          <Card className="p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Weekly trends", value: "$42.8k", icon: BarChart3 },
                { label: "AI insights", value: "Ready", icon: BrainCircuit },
                { label: "Secure auth", value: "Supabase", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-black/15 p-4">
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <p className="mt-5 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 h-64 rounded-lg border border-white/10 bg-gradient-to-br from-surface-800 via-surface-900 to-black p-5">
              <div className="flex h-full items-end gap-3">
                {[42, 56, 48, 72, 64, 88, 78].map((height, index) => (
                  <div key={index} className="flex flex-1 items-end rounded-md bg-white/[0.04] p-1">
                    <div
                      className="w-full rounded bg-gradient-to-t from-emerald-400 to-sky-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
