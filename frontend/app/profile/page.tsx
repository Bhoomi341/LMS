"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/contexts/auth-context";

function ProfileContent() {
  const { user: ctxUser } = useAuth();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: me } = await apiClient.get<User>("/api/auth/me");
      return me;
    },
    initialData: ctxUser ?? undefined,
  });

  const user = data ?? ctxUser;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Profile</h1>
      <p className="mt-2 text-slate-400">Signed-in learner details from the API.</p>
      <dl className="mt-8 space-y-4 rounded-2xl border border-surface-muted bg-surface-card p-6">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
          <dd className="mt-1 text-lg text-white">{user?.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="mt-1 text-lg text-white">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">User ID</dt>
          <dd className="mt-1 font-mono text-sm text-slate-300">{user?.id}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
