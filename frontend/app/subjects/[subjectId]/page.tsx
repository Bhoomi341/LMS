"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import type { SubjectSummary, SubjectTreeResponse } from "@/lib/types";

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = Number(params.subjectId);
  const { user } = useAuth();

  const subjectQuery = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data } = await apiClient.get<SubjectSummary>(`/api/subjects/${subjectId}`);
      return data;
    },
    enabled: Number.isFinite(subjectId),
  });

  const treeQuery = useQuery({
    queryKey: ["subject", subjectId, "tree", user?.id ?? "guest"],
    queryFn: async () => {
      const { data } = await apiClient.get<SubjectTreeResponse>(`/api/subjects/${subjectId}/tree`);
      return data;
    },
    enabled: Number.isFinite(subjectId),
  });

  const firstQuery = useQuery({
    queryKey: ["subject", subjectId, "first-video", user?.id ?? "guest"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ videoId: number | null }>(
        `/api/subjects/${subjectId}/first-video`
      );
      return data;
    },
    enabled: Number.isFinite(subjectId),
  });

  if (!Number.isFinite(subjectId)) {
    return <p className="p-8 text-center text-red-300">Invalid subject.</p>;
  }

  if (subjectQuery.isLoading) {
    return (
      <div className="p-12 text-center text-slate-400" role="status">
        Loading…
      </div>
    );
  }

  if (subjectQuery.isError || !subjectQuery.data) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-red-200">Subject not found or unavailable.</p>
        <Link href="/subjects" className="mt-4 inline-block text-accent hover:underline">
          ← All subjects
        </Link>
      </div>
    );
  }

  const subject = subjectQuery.data;
  const firstId = firstQuery.data?.videoId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/subjects" className="text-sm text-accent hover:underline">
        ← All subjects
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-white">{subject.title}</h1>
      {subject.description && <p className="mt-3 text-slate-300">{subject.description}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        {user && firstId ? (
          <Link
            href={`/subjects/${subjectId}/video/${firstId}`}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-surface hover:bg-accent-dim"
          >
            {treeQuery.data?.sections.some((sec) => sec.videos.some((v) => v.completed))
              ? "Continue learning"
              : "Start learning"}
          </Link>
        ) : !user ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/subjects/${subjectId}`)}`}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-surface hover:bg-accent-dim"
          >
            Sign in to learn
          </Link>
        ) : (
          <span className="text-slate-500">No videos in this subject yet.</span>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-white">Outline</h2>
        {treeQuery.isLoading && <p className="mt-2 text-slate-500">Loading outline…</p>}
        {treeQuery.data && (
          <ol className="mt-4 space-y-6">
            {treeQuery.data.sections.map((sec) => (
              <li key={sec.id} className="rounded-xl border border-surface-muted bg-surface-card/60 p-4">
                <p className="font-medium text-slate-200">{sec.title}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-400">
                  {sec.videos.map((v) => (
                    <li key={v.id} className="flex items-center gap-2">
                      <span className={v.completed ? "text-emerald-400/90" : ""}>{v.title}</span>
                      {v.locked && <span className="text-amber-400/80">(locked)</span>}
                      {user && !v.locked && (
                        <Link className="text-accent hover:underline" href={`/subjects/${subjectId}/video/${v.id}`}>
                          Open
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
