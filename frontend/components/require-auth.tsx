"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) return;
    const next = encodeURIComponent(pathname);
    router.replace(`/login?next=${next}`);
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400" role="status">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400" role="status">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
