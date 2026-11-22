"use client";

import Link from "next/link";
import { useState } from "react";
import { FastTrackModal } from "./fast-track-modal";
import { Icon } from "./icon";
import { Button, ErrorNote, ProgressBar } from "./ui";
import { skipLesson } from "@/lib/hooks";
import {
  filterTopicGroups,
  groupLessonsByTopic,
  type TopicGroup,
} from "@/lib/learn-topics";
import type { LessonNode } from "@/lib/types";

const STATUS_META: Record<
  LessonNode["status"],
  { label: string; tone: string }
> = {
  COMPLETED: { label: "Đã xong", tone: "bg-good/10 text-good" },
  IN_PROGRESS: { label: "Đang học", tone: "bg-primary/10 text-primary" },
  AVAILABLE: { label: "Sẵn sàng", tone: "bg-accent/10 text-accent" },
  LOCKED: { label: "Sẵn sàng", tone: "bg-accent/10 text-accent" },
};

const TOPIC_STATUS_META: Record<
  TopicGroup["status"],
  { label: string; tone: string }
> = {
  COMPLETED: { label: "Đã xong", tone: "bg-good/10 text-good" },
  IN_PROGRESS: { label: "Đang học", tone: "bg-primary/10 text-primary" },
  AVAILABLE: { label: "Sẵn sàng", tone: "bg-accent/10 text-accent" },
};

type TopicFilter = "all" | "todo" | "done";

interface FastTrackTarget {
  title: string;
  lessonIds: string[];
  firstLessonId: string | null;
}

export function LessonPath({
  lessons,
  limit,
  currentLessonId,
  onMutate,
}: {
  lessons: LessonNode[];
  limit?: number;
  currentLessonId?: string | null;
  onMutate?: () => Promise<unknown> | void;
}) {
  const [filter, setFilter] = useState<TopicFilter>("all");
  const [query, setQuery] = useState("");
  const [allExpanded, setAllExpanded] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [skippingId, setSkippingId] = useState<string | null>(null);
  const [skipError, setSkipError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [fastTrackTarget, setFastTrackTarget] =
    useState<FastTrackTarget | null>(null);

  if (limit) {
    const firstIncompleteIdx = lessons.findIndex(
      (l) => l.status !== "COMPLETED",
    );
    const preferredIdx = currentLessonId
      ? lessons.findIndex(
          (l) => l.id === currentLessonId && l.status !== "COMPLETED",
        )
      : -1;
    const startIdx =
      preferredIdx >= 0
        ? preferredIdx
        : firstIncompleteIdx >= 0
          ? firstIncompleteIdx
          : 0;
    const shown = lessons.slice(startIdx, startIdx + limit);

    return (
      <ol className="space-y-3">
        {shown.map((l) => {
          const meta = STATUS_META[l.status];
          const pct = l.wordCount ? (l.startedWords / l.wordCount) * 100 : 0;
          return (
            <li key={l.id}>
              <Link
                href={`/study?lesson=${l.id}&quick=1`}
                className="block rounded-2xl"
                aria-label={`Học nhanh ${l.title}`}
              >
                <div className="panel hover-card group flex items-center gap-4 p-4 sm:p-5">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      l.status === "COMPLETED"
                        ? "bg-good/15 text-good"
                        : "bg-primary/12 text-primary"
                    }`}
                  >
                    {l.status === "COMPLETED" ? (
                      <Icon name="check" size={20} />
                    ) : (
                      l.orderIndex
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{l.title}</span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${meta.tone}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="word-display mt-0.5 truncate text-sm text-muted">
                      {l.previewWords.join("  ")}
                      {l.previewWords.length ? "…" : ""}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <ProgressBar value={pct} label={`Tiến độ ${l.title}`} />
                      <span className="shrink-0 text-xs text-muted">
                        {l.startedWords}/{l.wordCount}
                      </span>
                    </div>
                  </div>

                  <Icon
                    name="arrow"
                    size={18}
                    className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    data-icon="arrow"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    );
  }

  const groups = groupLessonsByTopic(lessons);
  const filteredGroups = filterTopicGroups(groups, filter, query);
  const todoCount = groups.filter((g) => g.status !== "COMPLETED").length;
  const doneCount = groups.length - todoCount;

  const defaultOpenGroup =
    groups.find((g) => g.lessons.some((l) => l.id === currentLessonId)) ??
    groups.find((g) => g.status !== "COMPLETED") ??
    groups[0];
  const defaultOpenKey = defaultOpenGroup?.key ?? "";

  function toggleExpand(key: string, currentValue: boolean) {
    setExpanded((prev) => ({ ...prev, [key]: !currentValue }));
  }

  function handleToggleAll() {
    setExpanded({});
    setAllExpanded((prev) => !prev);
  }

  async function handleSkipLesson(lesson: LessonNode) {
    if (skippingId) return;
    setSkippingId(lesson.id);
    setSkipError(null);
    setActionNotice(null);
    try {
      await skipLesson(lesson.id);
      await onMutate?.();
      setActionNotice(`Đã đánh dấu hoàn thành "${lesson.title}".`);
    } catch {
      setSkipError(
        `Chưa đánh dấu xong bài "${lesson.title}". Bạn thử lại nhé.`,
      );
    } finally {
      setSkippingId(null);
    }
  }

  const filterTabs: { key: TopicFilter; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: groups.length },
    { key: "todo", label: "Chưa xong", count: todoCount },
    { key: "done", label: "Đã xong", count: doneCount },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2/50 p-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Lọc chủ đề"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={`motion-button inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === tab.key
                  ? "bg-primary text-primary-fg shadow-xs"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  filter === tab.key
                    ? "bg-primary-fg/20 text-primary-fg"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          <div className="relative min-w-[190px] flex-1 sm:max-w-xs">
            <Icon
              name="search"
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm chủ đề hoặc từ vựng…"
              aria-label="Tìm chủ đề hoặc từ vựng"
              className="field min-h-9! w-full py-1.5! pr-3! pl-9! text-xs!"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleToggleAll}
            className="min-h-9! px-3! py-1.5! text-xs!"
          >
            {allExpanded ? "Thu gọn" : "Mở rộng tất cả"}
          </Button>
        </div>
      </div>

      {skipError && <ErrorNote>{skipError}</ErrorNote>}

      {actionNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-xl border border-good/25 bg-good/10 px-4 py-2.5 text-xs font-medium text-good"
        >
          <span className="flex items-center gap-2">
            <Icon name="check" size={16} />
            {actionNotice}
          </span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            aria-label="Ẩn thông báo"
            className="rounded-md p-1 hover:bg-good/15"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {filteredGroups.length === 0 ? (
        <div className="panel p-6 text-center text-sm text-muted">
          Không tìm thấy chủ đề phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <ol className="space-y-3">
          {filteredGroups.map((group) => {
            const topicMeta = TOPIC_STATUS_META[group.status];
            const topicPct = group.totalWords
              ? (group.startedWords / group.totalWords) * 100
              : 0;
            const isExpanded =
              expanded[group.key] ??
              (allExpanded ||
                Boolean(query.trim()) ||
                group.key === defaultOpenKey);
            const incompleteIds = group.lessons
              .filter((l) => l.status !== "COMPLETED")
              .map((l) => l.id)
              .slice(0, 20);

            return (
              <li
                key={group.key}
                className="panel overflow-hidden border border-border transition-colors"
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpand(group.key, isExpanded)}
                    className="flex min-w-0 flex-1 items-start gap-3.5 text-left"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        group.status === "COMPLETED"
                          ? "bg-good/15 text-good"
                          : group.status === "IN_PROGRESS"
                            ? "bg-primary/12 text-primary"
                            : "bg-surface-2 text-foreground"
                      }`}
                    >
                      {group.status === "COMPLETED" ? (
                        <Icon name="check" size={20} />
                      ) : (
                        String(group.index).padStart(2, "0")
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold tracking-tight">
                          {group.title}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${topicMeta.tone}`}
                        >
                          {topicMeta.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {group.completedLessons}/{group.totalLessons} bài ·{" "}
                        {group.totalWords} từ
                        {group.previewWords.length > 0 && (
                          <span lang="en" className="word-display ml-2">
                            · {group.previewWords.join(" · ")}
                          </span>
                        )}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <ProgressBar
                          value={topicPct}
                          label={`Tiến độ chủ đề ${group.title}`}
                        />
                        <span className="shrink-0 text-xs text-muted tabular-nums">
                          {group.startedWords}/{group.totalWords} từ
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pl-2">
                    {group.status !== "COMPLETED" &&
                      group.firstIncompleteLessonId && (
                        <>
                          <Link
                            href={`/study?lesson=${group.firstIncompleteLessonId}&quick=1`}
                            className="motion-button inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg shadow-xs hover:bg-primary/90"
                          >
                            <Icon name="play" size={14} /> Học ngay
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setFastTrackTarget({
                                title: group.title,
                                lessonIds: incompleteIds,
                                firstLessonId: group.firstIncompleteLessonId,
                              })
                            }
                            className="motion-button inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/6 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/12"
                          >
                            <Icon name="spark" size={14} /> Vượt nhanh
                          </button>
                        </>
                      )}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Thu gọn ${group.title}`
                          : `Mở rộng ${group.title}`
                      }
                      onClick={() => toggleExpand(group.key, isExpanded)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                    >
                      <Icon
                        name="chevron"
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <ol className="divide-y divide-border border-t border-border bg-surface-2/35">
                    {group.lessons.map((l) => {
                      const meta = STATUS_META[l.status];
                      const pct = l.wordCount
                        ? (l.startedWords / l.wordCount) * 100
                        : 0;
                      const isSkipping = skippingId === l.id;

                      return (
                        <li
                          key={l.id}
                          className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:px-5"
                        >
                          <Link
                            href={`/study?lesson=${l.id}&quick=1`}
                            className="group flex min-w-0 flex-1 items-center gap-3.5 rounded-xl"
                            aria-label={`Học nhanh ${l.title}`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                l.status === "COMPLETED"
                                  ? "bg-good/15 text-good"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {l.status === "COMPLETED" ? (
                                <Icon name="check" size={16} />
                              ) : (
                                l.orderIndex
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold group-hover:text-primary">
                                  {l.title}
                                </span>
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${meta.tone}`}
                                >
                                  {meta.label}
                                </span>
                              </div>
                              <p className="word-display mt-0.5 truncate text-xs text-muted">
                                {l.previewWords.join("  ")}
                                {l.previewWords.length ? "…" : ""}
                              </p>
                              <div className="mt-1.5 flex items-center gap-2">
                                <ProgressBar
                                  value={pct}
                                  label={`Tiến độ ${l.title}`}
                                />
                                <span className="shrink-0 text-[11px] text-muted tabular-nums">
                                  {l.startedWords}/{l.wordCount}
                                </span>
                              </div>
                            </div>
                          </Link>

                          <div className="flex shrink-0 items-center justify-end gap-2">
                            <Link
                              href={`/learn/${l.id}`}
                              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted hover:border-primary/30 hover:text-primary"
                            >
                              <Icon name="book" size={13} /> Từ vựng
                            </Link>
                            {l.status !== "COMPLETED" && (
                              <button
                                type="button"
                                disabled={skippingId !== null}
                                onClick={() => void handleSkipLesson(l)}
                                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-good/40 hover:bg-good/8 hover:text-good disabled:opacity-50"
                              >
                                <Icon name="check" size={13} />
                                {isSkipping ? "Đang lưu…" : "Đã biết"}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {fastTrackTarget && (
        <FastTrackModal
          topicTitle={fastTrackTarget.title}
          lessonIds={fastTrackTarget.lessonIds}
          firstLessonId={fastTrackTarget.firstLessonId}
          onClose={() => setFastTrackTarget(null)}
          onPassed={async () => {
            await onMutate?.();
            setActionNotice(
              `Đã vượt nhanh chủ đề "${fastTrackTarget.title}"!`,
            );
          }}
        />
      )}
    </div>
  );
}
