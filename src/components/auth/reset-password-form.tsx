"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { resetPasswordSchema } from "@/lib/auth-schemas";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function getZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form fields.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setIsSubmitting(true);

    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget).entries()));

    if (!parsed.success) {
      setError(getZodError(parsed.error));
      setIsSubmitting(false);
      return;
    }

    const { error: updateError } = await getSupabaseBrowserClient().auth.updateUser({
      password: parsed.data.password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess("Password updated. You can continue to the dashboard.");
    setIsSubmitting(false);
    window.setTimeout(() => router.replace("/dashboard"), 900);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-glow">
      <h1 className="text-2xl font-semibold text-white">Set a new password</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Use the recovery link from your email, then create a new password for your account.
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-300">New password</span>
          <input
            name="password"
            type="password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Confirm password</span>
          <input
            name="confirmPassword"
            type="password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
            placeholder="Repeat password"
          />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-surface-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Update password
      </button>

      <Link href="/auth" className="mt-5 block text-center text-sm text-slate-400 transition hover:text-white">
        Back to sign in
      </Link>
    </form>
  );
}
