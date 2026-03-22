"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { VideoDetailResponse } from "@/lib/types";
import { loadYoutubeIframeApi } from "@/lib/youtube-api";

type Props = {
  subjectId: number;
  video: VideoDetailResponse;
  autosaveSeconds?: number;
};

export function VideoPlayer({ subjectId, video, autosaveSeconds = 8 }: Props) {
  const queryClient = useQueryClient();
  const playerId = useId().replace(/:/g, "");
  const playerRef = useRef<YT.Player | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef(video);
  videoRef.current = video;

  const postProgress = useCallback(
    async (lastPositionSeconds: number, durationSeconds: number) => {
      try {
        await apiClient.post(`/api/progress/videos/${videoRef.current.id}`, {
          last_position_seconds: Math.floor(lastPositionSeconds),
          duration_seconds: Math.floor(durationSeconds),
        });
        await queryClient.invalidateQueries({ queryKey: ["subject", subjectId] });
        await queryClient.invalidateQueries({ queryKey: ["video", videoRef.current.id] });
      } catch {
        /* transient network errors — ignore */
      }
    },
    [queryClient, subjectId]
  );

  const saveFromPlayer = useCallback(() => {
    const p = playerRef.current;
    if (!p || typeof p.getCurrentTime !== "function" || typeof p.getDuration !== "function") return;
    const t = p.getCurrentTime();
    const d = p.getDuration();
    if (!Number.isFinite(t) || !Number.isFinite(d) || d <= 0) return;
    void postProgress(t, d);
  }, [postProgress]);

  useEffect(() => {
    let destroyed = false;

    async function setup() {
      await loadYoutubeIframeApi();
      if (destroyed || !window.YT?.Player) return;

      const startSeconds = videoRef.current.progress?.lastPositionSeconds ?? 0;
      const start = startSeconds > 2 ? Math.floor(startSeconds) : 0;

      playerRef.current = new window.YT.Player(`yt-${playerId}`, {
        videoId: videoRef.current.youtubeVideoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          start,
        },
        events: {
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              const dur = e.target.getDuration();
              void postProgress(Number.isFinite(dur) ? dur : e.target.getCurrentTime(), dur);
            }
            if (e.data === YT.PlayerState.PAUSED) {
              saveFromPlayer();
            }
          },
        },
      });
    }

    void setup();

    return () => {
      destroyed = true;
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [video.id, playerId, postProgress, saveFromPlayer]);

  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      saveFromPlayer();
    }, autosaveSeconds * 1000);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    };
  }, [autosaveSeconds, saveFromPlayer]);

  const { title, navigation, progress } = video;
  const prevId = navigation.prevVideoId;
  const nextId = navigation.nextVideoId;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/subjects/${subjectId}`}
            className="text-sm text-accent transition-colors hover:underline"
          >
            ← Back to subject
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
          {progress?.isCompleted && (
            <p className="mt-1 text-sm text-emerald-400/90">You have completed this lesson.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {prevId ? (
            <Link
              href={`/subjects/${subjectId}/video/${prevId}`}
              className="rounded-lg border border-surface-muted px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-surface-muted"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-slate-600">
              Previous
            </span>
          )}
          {nextId ? (
            <Link
              href={`/subjects/${subjectId}/video/${nextId}`}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-accent-dim"
            >
              Next lesson
            </Link>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-slate-600">Next</span>
          )}
        </div>
      </div>

      <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-surface-muted bg-black shadow-xl">
        <div id={`yt-${playerId}`} className="h-full w-full" />
      </div>

      <p className="max-w-4xl text-xs text-slate-500">
        Progress saves automatically every {autosaveSeconds} seconds while this page is open, when you pause, and when
        the video ends. Resume uses your last saved position (≥90% counts as complete).
      </p>
    </div>
  );
}
