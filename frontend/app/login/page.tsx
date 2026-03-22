import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="text-center text-slate-400">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
