"use client";

import { Loader2, MailCheck, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { forgotPasswordSchema, profileSchema } from "@/lib/auth-schemas";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";

function getZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form fields.";
}

export function SettingsView() {
  const { user, refreshSession } = useAuth();
  const [profileMessage, setProfileMessage] = useState<string>();
  const [profileError, setProfileError] = useState<string>();
  const [securityMessage, setSecurityMessage] = useState<string>();
  const [securityError, setSecurityError] = useState<string>();
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false);
  const supabase = getSupabaseBrowserClient();
  const fullName = user?.user_metadata.full_name ?? user?.user_metadata.name ?? "";

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage(undefined);
    setProfileError(undefined);
    setIsProfileSaving(true);

    const parsed = profileSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget).entries()));

    if (!parsed.success) {
      setProfileError(getZodError(parsed.error));
      setIsProfileSaving(false);
      return;
    }

    if (!user?.id) {
      setProfileError("User session is missing.");
      setIsProfileSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { full_name: parsed.data.fullName },
    });

    if (error) {
      setProfileError(error.message);
    } else {
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: parsed.data.fullName,
        updated_at: new Date().toISOString(),
      });
      await refreshSession();
      setProfileMessage("Profile updated.");
    }

    setIsProfileSaving(false);
  }

  async function handlePasswordReset() {
    setSecurityMessage(undefined);
    setSecurityError(undefined);
    setIsSecuritySubmitting(true);

    const parsed = forgotPasswordSchema.safeParse({ email: user?.email });

    if (!parsed.success) {
      setSecurityError(getZodError(parsed.error));
      setIsSecuritySubmitting(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setSecurityError(error.message);
    } else {
      setSecurityMessage("Password reset email sent.");
    }

    setIsSecuritySubmitting(false);
  }

  async function handleResendConfirmation() {
    setSecurityMessage(undefined);
    setSecurityError(undefined);
    setIsSecuritySubmitting(true);

    if (!user?.email) {
      setSecurityError("Email address is missing.");
      setIsSecuritySubmitting(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setSecurityError(error.message);
    } else {
      setSecurityMessage("Verification email sent.");
    }

    setIsSecuritySubmitting(false);
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Settings"
        title="Account settings"
        description="Manage your profile details, email verification, and password recovery through Supabase Auth emails."
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-white">Profile details</h2>
          <p className="mt-1 text-sm text-slate-500">This updates Supabase user metadata and the `profiles` table.</p>

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Full name</span>
              <input
                name="fullName"
                defaultValue={fullName}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                placeholder="Your name"
              />
            </label>

            {profileError ? <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{profileError}</p> : null}
            {profileMessage ? <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{profileMessage}</p> : null}

            <button
              type="submit"
              disabled={isProfileSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProfileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save profile
            </button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-white">Security</h2>
          <p className="mt-1 text-sm text-slate-500">Supabase sends confirmation and recovery emails using Auth templates.</p>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={isSecuritySubmitting || Boolean(user?.email_confirmed_at)}
              className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <span>
                <span className="block text-sm font-semibold text-white">
                  {user?.email_confirmed_at ? "Email already verified" : "Resend verification email"}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-400">Send another account confirmation email to {user?.email}.</span>
              </span>
            </button>

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isSecuritySubmitting}
              className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-sky-400/30 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
              <span>
                <span className="block text-sm font-semibold text-white">Change password by email</span>
                <span className="mt-1 block text-sm leading-6 text-slate-400">Send a recovery link, then set a new password from the secure reset page.</span>
              </span>
            </button>
          </div>

          {securityError ? <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{securityError}</p> : null}
          {securityMessage ? <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{securityMessage}</p> : null}
        </Card>
      </section>
    </div>
  );
}
