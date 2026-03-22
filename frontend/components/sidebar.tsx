"use client";

import Link from "next/link";
import type { SubjectTreeResponse } from "@/lib/types";

type Props = {
  subjectId: number;
  tree: SubjectTreeResponse;
  currentVideoId: number;
};

export function Sidebar({ subjectId, tree, currentVideoId }: Props) {
  return (
    <aside className="w-full shrink-0 border-b border-surface-muted bg-surface-card/50 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="max-h-[40vh] overflow-y-auto p-4 lg:max-h-[calc(100vh-3.5rem)] lg:sticky lg:top-14">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Curriculum</h2>
        <nav className="mt-3 space-y-5">
          {tree.sections.map((section) => (
            <div key={section.id}>
              <p className="text-sm font-medium text-slate-200">{section.title}</p>
              <ul className="mt-2 space-y-1 border-l border-surface-muted pl-3">
                {section.videos.map((v) => {
                  const active = v.id === currentVideoId;
                  const content = (
                    <span className="flex items-center gap-2">
                      <span className="truncate">{v.title}</span>
                      {v.locked && (
                        <span className="shrink-0 text-[10px] font-medium uppercase text-amber-400/90">
                          Locked
                        </span>
                      )}
                      {v.completed && !v.locked && (
                        <span className="shrink-0 text-[10px] font-medium uppercase text-emerald-400/90">
                          Done
                        </span>
                      )}
                    </span>
                  );

                  if (v.locked) {
                    return (
                      <li key={v.id}>
                        <div
                          className={`block rounded-md px-2 py-1.5 text-sm text-slate-500 ${
                            active ? "bg-surface-muted/40" : ""
                          }`}
                          title="Complete the previous lesson to unlock"
                        >
                          {content}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={v.id}>
                      <Link
                        href={`/subjects/${subjectId}/video/${v.id}`}
                        className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-accent/15 font-medium text-accent"
                            : "text-slate-300 hover:bg-surface-muted hover:text-white"
                        }`}
                      >
                        {content}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
