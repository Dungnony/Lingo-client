import type { LessonNode } from "./types";

export interface TopicGroup {
  key: string;
  index: number;
  title: string;
  lessons: LessonNode[];
  totalWords: number;
  startedWords: number;
  learnedWords: number;
  completedLessons: number;
  totalLessons: number;
  status: "COMPLETED" | "IN_PROGRESS" | "AVAILABLE";
  firstIncompleteLessonId: string | null;
  previewWords: string[];
}

export function topicNameOf(title: string): string {
  return title.trim().replace(/\s*\(\d+\)$/, "").trim();
}

export function groupLessonsByTopic(lessons: LessonNode[]): TopicGroup[] {
  const buckets: { title: string; lessons: LessonNode[] }[] = [];

  for (const lesson of lessons) {
    const title = topicNameOf(lesson.title);
    const last = buckets[buckets.length - 1];
    if (last && last.title === title) {
      last.lessons.push(lesson);
    } else {
      buckets.push({ title, lessons: [lesson] });
    }
  }

  return buckets.map((bucket, idx) => {
    const totalWords = bucket.lessons.reduce((s, l) => s + l.wordCount, 0);
    const startedWords = bucket.lessons.reduce((s, l) => s + l.startedWords, 0);
    const learnedWords = bucket.lessons.reduce((s, l) => s + l.learnedWords, 0);
    const completedLessons = bucket.lessons.filter(
      (l) => l.status === "COMPLETED",
    ).length;
    const totalLessons = bucket.lessons.length;
    const hasProgress = bucket.lessons.some(
      (l) =>
        l.status === "COMPLETED" ||
        l.status === "IN_PROGRESS" ||
        l.startedWords > 0,
    );
    const status: TopicGroup["status"] =
      totalLessons > 0 && completedLessons === totalLessons
        ? "COMPLETED"
        : hasProgress
          ? "IN_PROGRESS"
          : "AVAILABLE";
    const firstIncomplete = bucket.lessons.find(
      (l) => l.status !== "COMPLETED",
    );

    const previewWords: string[] = [];
    const seenPreview = new Set<string>();
    for (const lesson of bucket.lessons) {
      for (const word of lesson.previewWords) {
        const lower = word.toLowerCase();
        if (seenPreview.has(lower)) continue;
        seenPreview.add(lower);
        previewWords.push(word);
        if (previewWords.length >= 5) break;
      }
      if (previewWords.length >= 5) break;
    }

    return {
      key: `${idx + 1}:${bucket.title}`,
      index: idx + 1,
      title: bucket.title,
      lessons: bucket.lessons,
      totalWords,
      startedWords,
      learnedWords,
      completedLessons,
      totalLessons,
      status,
      firstIncompleteLessonId: firstIncomplete?.id ?? null,
      previewWords,
    };
  });
}

export function filterTopicGroups(
  groups: TopicGroup[],
  filter: "all" | "todo" | "done",
  query: string,
): TopicGroup[] {
  const q = query.trim().toLowerCase();
  return groups.filter((g) => {
    if (filter === "todo" && g.status === "COMPLETED") return false;
    if (filter === "done" && g.status !== "COMPLETED") return false;
    if (!q) return true;
    if (g.title.toLowerCase().includes(q)) return true;
    if (g.lessons.some((l) => l.title.toLowerCase().includes(q))) return true;
    return g.previewWords.some((w) => w.toLowerCase().includes(q));
  });
}
