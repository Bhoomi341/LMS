"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export function SiteHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-surface-muted bg-surface-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Learn<span className="text-accent">Hub</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/subjects" className="text-slate-300 transition-colors hover:text-white">
            Subjects
          </Link>
          {loading ? (
            <span className="text-slate-500">…</span>
          ) : user ? (
            <>
              <Link href="/profile" className="text-slate-300 transition-colors hover:text-white">
                Profile
              </Link>
              <span className="hidden text-slate-400 sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-lg border border-surface-muted px-3 py-1.5 text-slate-200 transition-colors hover:bg-surface-muted"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 transition-colors hover:text-white">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-3 py-1.5 font-medium text-surface transition-colors hover:bg-accent-dim"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
