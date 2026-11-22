"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icon";
import { Button, ErrorNote, ProgressBar } from "@/components/ui";
import { createFastTrackQuiz, submitFastTrackQuiz } from "@/lib/hooks";
import type { FastTrackQuiz, FastTrackSubmitResult } from "@/lib/types";

interface AnswerEntry {
  wordId: string;
  chosen: string;
}

export function FastTrackModal({
  topicTitle,
  lessonIds,
  firstLessonId,
  onClose,
  onPassed,
}: {
  topicTitle: string;
  lessonIds: string[];
  firstLessonId: string | null;
  onClose: () => void;
  onPassed: () => Promise<void> | void;
}) {
  const titleId = useId();
  const lessonIdsSnapshot = useRef(lessonIds);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitLock = useRef(false);

  const [loadKey, setLoadKey] = useState(0);
  const [quiz, setQuiz] = useState<FastTrackQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState<AnswerEntry[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<FastTrackSubmitResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    createFastTrackQuiz(lessonIdsSnapshot.current)
      .then((data) => {
        if (cancelled) return;
        setQuiz(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error && err.message
            ? err.message
            : "Chưa tạo được bài kiểm tra nhanh. Hãy thử lại.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const submitAll = useCallback(
    async (attemptId: string, finalAnswers: AnswerEntry[]) => {
      if (submitLock.current) return;
      submitLock.current = true;
      setSubmitting(true);
      setSubmitError(null);
      setPendingSubmit(finalAnswers);
      try {
        const res = await submitFastTrackQuiz(attemptId, finalAnswers);
        setResult(res);
        setPendingSubmit(null);
        if (res.passed) {
          await onPassed();
        }
      } catch {
        setSubmitError(
          "Chưa nộp được kết quả kiểm tra nhanh. Bạn bấm thử nộp lại nhé.",
        );
      } finally {
        submitLock.current = false;
        setSubmitting(false);
      }
    },
    [onPassed],
  );

  const pickOption = useCallback(
    (option: string) => {
      if (!quiz || result || submitting || picked !== null) return;
      const current = quiz.questions[idx];
      if (!current) return;

      setPicked(option);
      const nextAnswers = [
        ...answers,
        { wordId: current.wordId, chosen: option },
      ];

      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        if (idx + 1 < quiz.questions.length) {
          setAnswers(nextAnswers);
          setPicked(null);
          setIdx(idx + 1);
        } else {
          setAnswers(nextAnswers);
          void submitAll(quiz.attemptId, nextAnswers);
        }
      }, 260);
    },
    [answers, idx, picked, quiz, result, submitAll, submitting],
  );

  const currentQuestion = quiz?.questions[idx];

  useEffect(() => {
    if (!currentQuestion || result || submitting || picked !== null) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        e.repeat ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        target?.closest("input, textarea, select, [contenteditable]")
      ) {
        return;
      }
      const optionIndex = Number(e.key) - 1;
      const option = currentQuestion?.options[optionIndex];
      if (option) {
        e.preventDefault();
        pickOption(option);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQuestion, pickOption, picked, result, submitting]);

  function retryQuiz() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    submitLock.current = false;
    setQuiz(null);
    setLoading(true);
    setLoadError(null);
    setIdx(0);
    setPicked(null);
    setAnswers([]);
    setPendingSubmit(null);
    setSubmitError(null);
    setResult(null);
    setLoadKey((k) => k + 1);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel relative w-full max-w-lg rounded-2xl bg-surface p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
              <Icon name="spark" size={14} /> Kiểm tra vượt nhanh
            </p>
            <h2
              id={titleId}
              className="mt-1 truncate text-lg font-bold tracking-tight"
            >
              {topicTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-muted">
            Đang tạo 5 câu kiểm tra nhanh…
          </div>
        )}

        {!loading && loadError && (
          <div className="mt-5 space-y-4">
            <ErrorNote>{loadError}</ErrorNote>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={retryQuiz}>Thử lại</Button>
            </div>
          </div>
        )}

        {!loading && !loadError && quiz && result && (
          <div className="mt-5 space-y-5 text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                result.passed
                  ? "bg-good/12 text-good"
                  : "bg-accent/12 text-accent"
              }`}
            >
              <Icon name={result.passed ? "trophy" : "target"} size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {result.passed
                  ? "Vượt chủ đề thành công!"
                  : "Chưa đủ điểm vượt nhanh"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {result.passed
                  ? `Đạt ${result.scorePct}% (${result.correctCount}/${result.totalQuestions}) — Đã hoàn thành ${result.completedLessons} bài (${result.skippedWords} từ)!`
                  : `Đạt ${result.scorePct}% (${result.correctCount}/${result.totalQuestions}) — Cần từ ${result.passThresholdPct}% để vượt chủ đề`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {result.passed ? (
                <Button onClick={onClose} className="w-full sm:w-auto">
                  Tiếp tục lộ trình <Icon name="arrow" size={16} />
                </Button>
              ) : (
                <>
                  {firstLessonId && (
                    <Link
                      href={`/study?lesson=${firstLessonId}&quick=1`}
                      className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm hover:bg-primary/90"
                    >
                      <Icon name="cards" size={16} /> Học flashcard chủ đề này
                    </Link>
                  )}
                  <Button variant="secondary" onClick={retryQuiz}>
                    <Icon name="refresh" size={16} /> Thử lại
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {!loading && !loadError && quiz && !result && currentQuestion && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Câu <strong className="text-foreground">{idx + 1}</strong> /{" "}
                {quiz.questions.length}
              </span>
              <span>Đạt từ {quiz.passThresholdPct}% để qua cả chủ đề</span>
            </div>
            <ProgressBar
              value={(idx / quiz.questions.length) * 100}
              label="Tiến độ kiểm tra nhanh"
            />

            <div className="rounded-2xl bg-surface-2/65 px-4 py-6 text-center">
              <p className="text-xs text-muted">Chọn nghĩa đúng của từ</p>
              <p lang="en" className="word-display mt-2 text-3xl font-bold">
                {currentQuestion.prompt}
              </p>
              {currentQuestion.pronunciation && (
                <p className="mt-1.5 text-sm text-primary">
                  {currentQuestion.pronunciation}
                </p>
              )}
            </div>

            <div className="space-y-2.5" role="group" aria-label="Chọn đáp án">
              {currentQuestion.options.map((opt, optionIndex) => {
                const isPicked = picked === opt;
                const isRight = opt === currentQuestion.answer;
                const revealed = picked !== null;
                let cls =
                  "border-border bg-surface hover:border-primary/35 hover:bg-surface-2";
                if (revealed) {
                  if (isRight) {
                    cls = "border-good bg-good/10 text-good";
                  } else if (isPicked) {
                    cls = "border-danger bg-danger/10 text-danger";
                  } else {
                    cls = "border-border bg-surface opacity-55";
                  }
                }
                return (
                  <button
                    key={`${optionIndex}-${opt}`}
                    type="button"
                    disabled={submitting || revealed}
                    onClick={() => pickOption(opt)}
                    className={`motion-button flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${cls}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-semibold text-muted">
                      {optionIndex + 1}
                    </span>
                    <span className="flex-1 font-medium">{opt}</span>
                    {revealed && isRight && (
                      <Icon name="check" size={17} className="shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {submitting && (
              <p role="status" className="text-center text-xs text-muted">
                Đang chấm điểm…
              </p>
            )}

            {submitError && pendingSubmit && (
              <div className="space-y-2.5">
                <ErrorNote>{submitError}</ErrorNote>
                <Button
                  className="w-full"
                  disabled={submitting}
                  onClick={() => void submitAll(quiz.attemptId, pendingSubmit)}
                >
                  Thử nộp lại
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
