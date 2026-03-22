export type SubjectSummary = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  createdAt: string;
};

export type TreeVideo = {
  id: number;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  orderIndex: number;
  durationSeconds: number;
  locked: boolean;
  completed: boolean;
  lastPositionSeconds: number;
};

export type TreeSection = {
  id: number;
  title: string;
  orderIndex: number;
  videos: TreeVideo[];
};

export type SubjectTreeResponse = {
  subjectId: number;
  sections: TreeSection[];
};

export type VideoDetailResponse = {
  id: number;
  subjectId: number;
  sectionId: number;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  youtubeUrl: string;
  durationSeconds: number;
  locked: boolean;
  progress: {
    lastPositionSeconds: number;
    isCompleted: boolean;
    completedAt: string | null;
  } | null;
  navigation: { prevVideoId: number | null; nextVideoId: number | null };
};
