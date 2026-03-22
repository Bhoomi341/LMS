"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SubjectSummary } from "@/lib/types";

export default function SubjectsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data: rows } = await apiClient.get<SubjectSummary[]>("/api/subjects");
      return rows;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400 sm:px-6" role="status">
        Loading subjects…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error instanceof Error ? error.message : "Could not load subjects. Is the API running?"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Subjects</h1>
      <p className="mt-2 text-slate-400">Published courses you can start immediately.</p>
      <ul className="mt-8 space-y-4">
        {data?.map((s) => (
          <li key={s.id}>
            <Link
              href={`/subjects/${s.id}`}
              className="block rounded-2xl border border-surface-muted bg-surface-card p-6 transition-colors hover:border-accent/40 hover:bg-surface-muted/30"
            >
              <h2 className="text-xl font-semibold text-white">{s.title}</h2>
              {s.description && <p className="mt-2 text-sm text-slate-400">{s.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
