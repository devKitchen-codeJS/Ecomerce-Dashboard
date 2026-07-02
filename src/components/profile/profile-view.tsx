"use client";

import { CalendarDays, Mail, ShieldCheck, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/providers/auth-provider";

export function ProfileView() {
  const { user } = useAuth();
  const fullName = user?.user_metadata.full_name ?? user?.user_metadata.name ?? "Account";
  const provider = user?.app_metadata.provider ?? "email";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Profile"
        title="Account profile"
        description="Basic account information from Supabase Auth. Organization-level profile data is prepared in the database schema for future expansion."
      />

      <Card className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <UserCircle className="h-10 w-10" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-semibold text-white">{fullName}</h2>
            <p className="mt-1 truncate text-sm text-slate-400">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user?.email_confirmed_at ? "Email verified" : "Email pending"}
              </Badge>
              <Badge>{provider}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Mail className="h-5 w-5 text-sky-300" />
          <p className="mt-4 text-sm text-slate-500">Email</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{user?.email}</p>
        </Card>
        <Card className="p-5">
          <CalendarDays className="h-5 w-5 text-emerald-300" />
          <p className="mt-4 text-sm text-slate-500">Created</p>
          <p className="mt-1 text-sm font-medium text-white">
            {user?.created_at ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(user.created_at)) : "Unknown"}
          </p>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="h-5 w-5 text-amber-300" />
          <p className="mt-4 text-sm text-slate-500">User ID</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{user?.id}</p>
        </Card>
      </section>
    </div>
  );
}
