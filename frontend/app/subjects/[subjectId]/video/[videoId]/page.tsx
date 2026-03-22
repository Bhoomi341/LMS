"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { RequireAuth } from "@/components/require-auth";
import { Sidebar } from "@/components/sidebar";
import { VideoPlayer } from "@/components/video-player";
import type { SubjectTreeResponse, VideoDetailResponse } from "@/lib/types";

function VideoLessonContent() {
  const params = useParams();
  const subjectId = Number(params.subjectId);
  const videoId = Number(params.videoId);

  const treeQuery = useQuery({
    queryKey: ["subject", subjectId, "tree", "auth"],
    queryFn: async () => {
      const { data } = await apiClient.get<SubjectTreeResponse>(`/api/subjects/${subjectId}/tree`);
      return data;
    },
    enabled: Number.isFinite(subjectId),
  });

  const videoQuery = useQuery({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const { data } = await apiClient.get<VideoDetailResponse>(`/api/videos/${videoId}`);
      return data;
    },
    enabled: Number.isFinite(videoId),
  });

  if (!Number.isFinite(subjectId) || !Number.isFinite(videoId)) {
    return <p className="p-8 text-center text-red-300">Invalid link.</p>;
  }

  if (videoQuery.isLoading || treeQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400" role="status">
        Loading lesson…
      </div>
    );
  }

  if (videoQuery.isError) {
    const status = isAxiosError(videoQuery.error) ? videoQuery.error.response?.status : undefined;
    const msg =
      isAxiosError(videoQuery.error) && videoQuery.error.response?.data &&
      typeof videoQuery.error.response.data === "object" &&
      "error" in videoQuery.error.response.data
        ? String((videoQuery.error.response.data as { error: string }).error)
        : "Could not load this video.";

    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <p className="text-lg text-red-200">{status === 403 ? "This lesson is locked." : msg}</p>
        {status === 403 && (
          <p className="mt-2 text-sm text-slate-400">Finish the previous lesson to continue.</p>
        )}
        <Link href={`/subjects/${subjectId}`} className="mt-6 inline-block text-accent hover:underline">
          Back to subject
        </Link>
      </div>
    );
  }

  if (!videoQuery.data || !treeQuery.data) {
    return null;
  }

  const video = videoQuery.data;
  if (video.subjectId !== subjectId) {
    return (
      <p className="p-8 text-center text-amber-200">
        This video does not belong to this subject.{" "}
        <Link className="text-accent underline" href={`/subjects/${video.subjectId}/video/${video.id}`}>
          Go to the correct page
        </Link>
      </p>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <Sidebar subjectId={subjectId} tree={treeQuery.data} currentVideoId={videoId} />
      <div className="min-w-0 flex-1">
        <VideoPlayer subjectId={subjectId} video={video} autosaveSeconds={8} />
      </div>
    </div>
  );
}

export default function VideoLessonPage() {
  return (
    <RequireAuth>
      <VideoLessonContent />
    </RequireAuth>
  );
}
