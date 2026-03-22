"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { isAxiosError } from "axios";

export function RegisterForm() {
  const { register, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) router.replace("/subjects");
  }, [user, router]);

  if (user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-slate-400" role="status">
        Redirecting…
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(email, password, name);
      router.replace("/subjects");
      router.refresh();
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(err.response?.data?.error ?? err.message)
        : "Could not register";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-surface-muted bg-surface-card p-8 shadow-xl"
    >
      <h1 className="text-2xl font-bold text-white">Create account</h1>
      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm text-slate-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-surface-muted bg-surface px-3 py-2 text-white outline-none ring-accent focus:ring-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-surface-muted bg-surface px-3 py-2 text-white outline-none ring-accent focus:ring-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-surface-muted bg-surface px-3 py-2 text-white outline-none ring-accent focus:ring-2"
        />
        <p className="text-xs text-slate-500">At least 8 characters.</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent py-2.5 font-medium text-surface transition-colors hover:bg-accent-dim disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
