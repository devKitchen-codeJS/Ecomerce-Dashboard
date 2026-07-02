"use client";

import { BarChart3, BrainCircuit, ChevronDown, Loader2, LogOut, Menu, RadioTower, Rows3, Settings, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/events", label: "Live Events", icon: Rows3 },
  { href: "/insights", label: "AI Insights", icon: BrainCircuit },
];

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, session, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const fullName = user?.user_metadata.full_name ?? user?.user_metadata.name ?? "Account";
  const email = user?.email ?? "";

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/auth");
    }
  }, [isLoading, router, session]);

  async function handleLogout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/");
  }

  if (isLoading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/10 bg-surface-900/95 p-4 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-0 lg:overflow-hidden lg:border-r-0 lg:p-0",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <RadioTower className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">Realtime Commerce AI</span>
              <span className="block truncate text-xs text-slate-500">Analytics cockpit</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "text-slate-400 hover:bg-white/[0.08] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">MVP status</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Mock data now powers weekly analytics and realtime event views separately.</p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountOpen((current) => !current)}
              className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 text-left transition hover:bg-white/[0.08]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                <UserCircle className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{fullName}</span>
                <span className="block truncate text-xs text-slate-500">{email}</span>
              </span>
              <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", isAccountOpen && "rotate-180")} />
            </button>

            {isAccountOpen ? (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-white/10 bg-surface-800 p-1 shadow-glow">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setIsAccountOpen(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setIsAccountOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-400/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {!isSidebarOpen ? (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-surface-800 text-slate-300 shadow-glow transition hover:bg-white/10 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}

      <main className={cn("min-w-0 flex-1 px-4 py-6 transition-all sm:px-6 lg:px-8", !isSidebarOpen && "pt-20 lg:pt-8")}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
