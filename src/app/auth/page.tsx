import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Suspense>
        <AuthForm />
      </Suspense>
    </main>
  );
}
