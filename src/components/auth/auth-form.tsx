"use client";

import { Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { forgotPasswordSchema, signInSchema, signUpSchema } from "@/lib/auth-schemas";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type AuthMode = "signin" | "signup" | "forgot";
type FormState = {
  error?: string;
  success?: string;
};

function getFormData(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}

function getZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form fields.";
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: isAuthLoading, session } = useAuth();
  const [mode, setMode] = useState<AuthMode>(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [formState, setFormState] = useState<FormState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, router, session]);

  async function handleGoogle() {
    setIsSubmitting(true);
    setFormState({});

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setFormState({ error: error.message });
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormState({});

    const raw = getFormData(event.currentTarget);

    if (mode === "signin") {
      const parsed = signInSchema.safeParse(raw);

      if (!parsed.success) {
        setFormState({ error: getZodError(parsed.error) });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(parsed.data);

      if (error) {
        setFormState({ error: error.message });
        setIsSubmitting(false);
        return;
      }

      router.replace("/dashboard");
      return;
    }

    if (mode === "signup") {
      const parsed = signUpSchema.safeParse(raw);

      if (!parsed.success) {
        setFormState({ error: getZodError(parsed.error) });
        setIsSubmitting(false);
        return;
      }

      const { email, password, fullName } = parsed.data;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        setFormState({ error: error.message });
      } else {
        setFormState({ success: "Account created. Check your email to confirm it, then sign in." });
        setMode("signin");
      }

      setIsSubmitting(false);
      return;
    }

    const parsed = forgotPasswordSchema.safeParse(raw);

    if (!parsed.success) {
      setFormState({ error: getZodError(parsed.error) });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setFormState({ error: error.message });
    } else {
      setFormState({ success: "Password reset email sent. Check your inbox for the Supabase recovery link." });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.035] p-1">
        {[
          { value: "signin", label: "Sign in" },
          { value: "signup", label: "Register" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setMode(item.value as AuthMode);
              setFormState({});
            }}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition",
              mode === item.value ? "bg-white text-surface-900" : "text-slate-400 hover:text-white",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-glow">
        <h1 className="text-2xl font-semibold text-white">
          {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {mode === "forgot"
            ? "Enter your email and Supabase will send the recovery link."
            : "Use Google or email to access your analytics workspace."}
        </p>

        {mode !== "forgot" ? (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isSubmitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>
        ) : null}

        <div className="mt-5 space-y-4">
          {mode === "signup" ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Full name</span>
              <input
                name="fullName"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                placeholder="Ada Lovelace"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
              placeholder="you@company.com"
            />
          </label>

          {mode !== "forgot" ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Password</span>
              <input
                name="password"
                type="password"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                placeholder="At least 8 characters"
              />
            </label>
          ) : null}

          {mode === "signup" ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                placeholder="Repeat password"
              />
            </label>
          ) : null}
        </div>

        {formState.error ? <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{formState.error}</p> : null}
        {formState.success ? <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{formState.success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset email" : "Sign in"}
        </button>

        <div className="mt-5 flex items-center justify-between gap-4 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "forgot" ? "signin" : "forgot");
              setFormState({});
            }}
            className="text-slate-400 transition hover:text-white"
          >
            {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
          </button>
          <Link href="/" className="text-slate-400 transition hover:text-white">
            Back home
          </Link>
        </div>
      </form>
    </div>
  );
}
