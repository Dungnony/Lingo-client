"use client";

import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { Icon } from "@/components/icon";
import {
  Button,
  Card,
  ErrorNote,
  ProgressBar,
  SectionHeading,
} from "@/components/ui";
import {
  PracticeLibrary,
  PracticeTips,
} from "@/components/practice/practice-library";
import { useAttemptTimer } from "@/components/practice/use-attempt-timer";
import { useWordAudio } from "@/components/practice/use-word-audio";
import { gradeDictation, type DictationResult } from "@/lib/dictation";
import {
  evaluateWritingSentence,
  recordPracticeAttempt,
  usePracticeStats,
} from "@/lib/hooks";
import type { SentenceEvaluation, Word } from "@/lib/types";

const PLAYBACK_RATES = [0.75, 1] as const;
type WritingMode = "dictation" | "sentence";

export default function WritingPage() {
  return (
    <PracticeLibrary
      skill="writing"
      title="Luyện viết & chính tả"
      description="Nghe chép chính tả từng câu hoặc tự đặt câu với từ vựng để AI chấm và sửa ngữ pháp."
      startSteps={[
        "Chọn nhóm từ theo cấp độ để bắt đầu luyện viết.",
        "Ở chế độ Chép chính tả: nghe câu mẫu, gõ lại và đối chiếu từng từ.",
        "Ở chế độ Đặt câu với AI: tự viết câu bằng tiếng Anh và nhận góp ý sửa lỗi tự nhiên.",
      ]}
    >
      {(words) => <WritingWorkspace words={words} />}
    </PracticeLibrary>
  );
}

function WritingWorkspace({ words }: { words: Word[] }) {
  const [mode, setMode] = useState<WritingMode>("dictation");

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Chế độ luyện viết"
        className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-border bg-surface p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "dictation"}
          onClick={() => setMode("dictation")}
          className={`motion-button inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            mode === "dictation"
              ? "bg-primary text-primary-fg shadow-xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Icon name="headphones" size={15} />
          Nghe & chép chính tả
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sentence"}
          onClick={() => setMode("sentence")}
          className={`motion-button inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            mode === "sentence"
              ? "bg-primary text-primary-fg shadow-xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Icon name="spark" size={15} />
          Đặt câu & AI sửa lỗi
        </button>
      </div>

      {mode === "dictation" ? (
        <DictationSession words={words} />
      ) : (
        <SentenceWritingSession words={words} />
      )}
    </div>
  );
}

interface SavedAnswer {
  value: string;
  result: DictationResult;
}

function DictationSession({ words }: { words: Word[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SavedAnswer>>({});
  const stats = usePracticeStats("WRITING");
  const withSentence = words.filter((w) => w.examples?.[0]?.en);
  const completed = Object.keys(answers).length;
  const perfect = Object.values(answers).filter(
    (a) => a.result.isPerfect,
  ).length;
  const word = withSentence[index];
  const takeElapsed = useAttemptTimer(word?.id ?? "");

  if (!word) {
    return (
      <Card>
        <p className="text-sm text-muted">
          Nhóm từ này chưa có câu ví dụ để luyện chính tả. Hãy chọn nhóm khác hoặc
          chuyển sang tab <strong>Đặt câu & AI sửa lỗi</strong>.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        <Card>
          <SectionHeading
            icon="pencil"
            eyebrow="Nghe & gõ lại"
            title="Bạn vừa nghe câu gì?"
            tone="accent"
            className="mb-5"
          >
            <span className="rounded-lg bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
              {index + 1} / {withSentence.length}
            </span>
          </SectionHeading>
          <DictationItem
            key={word.id}
            word={word}
            sentence={word.examples![0]}
            saved={answers[word.id]}
            onCheck={(value, result) => {
              setAnswers((current) => ({
                ...current,
                [word.id]: { value, result },
              }));
              void recordPracticeAttempt(
                word.id,
                "WRITING",
                takeElapsed(),
                result.isPerfect,
              ).then(() => stats.mutate());
            }}
          />
        </Card>
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <Icon name="back" size={16} />
            Câu trước
          </Button>
          <Button
            disabled={index === withSentence.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            Câu tiếp theo
            <Icon name="arrow" size={16} />
          </Button>
        </div>
      </div>

      <PracticeTips
        title="Chép chính tả hiệu quả hơn"
        tips={[
          "Nghe trọn câu một lần để nắm ý, sau đó nghe chậm để bắt từng từ.",
          "Chú ý các từ nhỏ dễ bị nuốt âm: a, the, to, of, -s, -ed.",
          "Không cần gõ dấu câu hay viết hoa — Lingo chỉ chấm từng từ.",
        ]}
      >
        <Card>
          <SectionHeading
            icon="target"
            title="Tiến độ nhóm câu này"
            tone="good"
          />
          <p className="mb-3 mt-5 text-3xl font-semibold">
            {completed}
            <span className="ml-1 text-sm font-normal text-muted">
              / {withSentence.length} câu
            </span>
          </p>
          <ProgressBar
            value={(completed / withSentence.length) * 100}
            label="Câu đã luyện chính tả trong nhóm này"
          />
          <div className="mt-5 flex justify-between text-sm">
            <span className="text-muted">Chép đúng hoàn toàn</span>
            <span className="font-semibold text-good">{perfect}</span>
          </div>
        </Card>
        {stats.data && stats.data.totalAttempts > 0 && (
          <Card>
            <SectionHeading
              icon="chart"
              eyebrow="Từ trước đến nay"
              title="Luyện viết & chính tả"
              tone="lavender"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-semibold">
                  {stats.data.totalAttempts.toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-muted">lượt đã luyện</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">
                  {stats.data.accuracyPct ?? 0}%
                </p>
                <p className="text-xs text-muted">đạt chuẩn</p>
              </div>
            </div>
          </Card>
        )}
      </PracticeTips>
    </div>
  );
}

function DictationItem({
  word,
  sentence,
  saved,
  onCheck,
}: {
  word: Word;
  sentence: { en: string; vi: string | null };
  saved?: SavedAnswer;
  onCheck: (value: string, result: DictationResult) => void;
}) {
  const [value, setValue] = useState(saved?.value ?? "");
  const [rate, setRate] = useState<number>(1);
  const audio = useWordAudio(sentence.en);
  const checked = saved !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-2/60 p-5">
        <button
          type="button"
          onClick={() => {
            if (audio.playing) audio.stop();
            else audio.play(rate);
          }}
          aria-label={audio.playing ? "Dừng âm thanh" : "Nghe câu cần chép"}
          className="motion-button flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg shadow-black/10 transition-transform hover:scale-105"
        >
          <Icon name={audio.playing ? "close" : "play"} size={24} />
        </button>
        <div className="min-w-0 flex-1">
          <p aria-live="polite" className="text-sm font-medium">
            {audio.playing ? "Đang đọc câu…" : "Nhấn để nghe câu"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Từ khoá của câu: <strong className="text-primary">{word.word}</strong>
          </p>
        </div>
        <div role="group" aria-label="Tốc độ đọc" className="flex gap-2">
          {PLAYBACK_RATES.map((speed) => (
            <button
              key={speed}
              type="button"
              aria-pressed={rate === speed}
              onClick={() => {
                audio.stop();
                setRate(speed);
              }}
              className={`min-h-9 rounded-lg px-3 text-xs font-medium transition-colors ${rate === speed ? "bg-primary/10 text-primary" : "bg-surface text-muted hover:text-primary"}`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>
      {audio.error && <ErrorNote>{audio.error}</ErrorNote>}

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.trim() || checked || !audio.hasPlayed) return;
          onCheck(value, gradeDictation(sentence.en, value));
        }}
      >
        <label htmlFor="dictation-answer" className="block text-sm font-semibold">
          Gõ lại câu bạn nghe được
        </label>
        <textarea
          id="dictation-answer"
          lang="en"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={checked}
          rows={3}
          placeholder="Type the sentence you hear…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="field resize-none"
          required
        />
        {!audio.hasPlayed && !checked && (
          <p className="text-xs text-muted">Nhấn nghe trước khi kiểm tra.</p>
        )}
        {!checked && (
          <Button type="submit" disabled={!value.trim() || !audio.hasPlayed}>
            <Icon name="check" size={16} />
            Kiểm tra
          </Button>
        )}
      </form>

      {saved && (
        <div
          role="status"
          className={`rounded-xl border p-5 ${saved.result.isPerfect ? "border-good/20 bg-good/5" : "border-primary/20 bg-primary/5"}`}
        >
          <p
            className={`flex items-center gap-2 text-sm font-semibold ${saved.result.isPerfect ? "text-good" : "text-primary"}`}
          >
            <Icon name={saved.result.isPerfect ? "check" : "info"} size={18} />
            {saved.result.isPerfect
              ? "Chính xác từng từ, tuyệt vời!"
              : `Đúng ${saved.result.correctCount}/${saved.result.words.length} từ${saved.result.extraCount ? ` · thừa ${saved.result.extraCount} từ` : ""}`}
          </p>
          <p lang="en" className="mt-4 text-xl leading-9">
            {saved.result.words.map((w, i) => (
              <span
                key={i}
                className={
                  w.correct
                    ? "text-foreground"
                    : "rounded bg-danger/10 px-1 text-danger underline decoration-wavy"
                }
              >
                {w.text}{" "}
              </span>
            ))}
          </p>
          {sentence.vi && (
            <p className="mt-2 text-sm text-muted">{sentence.vi}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface SavedSentenceEval {
  sentence: string;
  evalResult: SentenceEvaluation;
}

function SentenceWritingSession({ words }: { words: Word[] }) {
  const [index, setIndex] = useState(0);
  const [savedByWord, setSavedByWord] = useState<
    Record<string, SavedSentenceEval>
  >({});
  const stats = usePracticeStats("WRITING");
  const word = words[index];
  const completedCount = Object.keys(savedByWord).length;

  if (!word) {
    return (
      <Card>
        <p className="text-sm text-muted">Không có từ vựng trong nhóm này.</p>
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        <Card>
          <SectionHeading
            icon="spark"
            eyebrow="Đặt câu thực tế"
            title="Viết 1 câu tiếng Anh với từ bên dưới"
            tone="primary"
            className="mb-5"
          >
            <span className="rounded-lg bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
              {index + 1} / {words.length}
            </span>
          </SectionHeading>

          <SentenceWordForm
            key={word.id}
            word={word}
            saved={savedByWord[word.id]}
            onEvaluated={(sentence, evalResult) => {
              setSavedByWord((prev) => ({
                ...prev,
                [word.id]: { sentence, evalResult },
              }));
              void stats.mutate();
            }}
          />
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <Icon name="back" size={16} />
            Từ trước
          </Button>
          <Button
            disabled={index === words.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            Từ tiếp theo
            <Icon name="arrow" size={16} />
          </Button>
        </div>
      </div>

      <PracticeTips
        title="Đặt câu để nhớ lâu"
        tips={[
          "Viết về bản thân hoặc tình huống quen thuộc giúp não nhớ từ nhanh hơn học vẹt.",
          "Đủ chủ ngữ + động từ + hoàn cảnh (thời gian, nơi chốn) để câu tự nhiên hơn.",
          "Có thể sửa lại câu nhiều lần sau khi AI góp ý để tăng điểm.",
        ]}
      >
        <Card>
          <SectionHeading
            icon="target"
            title="Tiến độ đặt câu"
            tone="good"
          />
          <p className="mb-3 mt-5 text-3xl font-semibold">
            {completedCount}
            <span className="ml-1 text-sm font-normal text-muted">
              / {words.length} từ
            </span>
          </p>
          <ProgressBar
            value={(completedCount / words.length) * 100}
            label="Số từ đã đặt câu trong nhóm"
          />
        </Card>
      </PracticeTips>
    </div>
  );
}

function SentenceWordForm({
  word,
  saved,
  onEvaluated,
}: {
  word: Word;
  saved?: SavedSentenceEval;
  onEvaluated: (sentence: string, result: SentenceEvaluation) => void;
}) {
  const [sentence, setSentence] = useState(saved?.sentence ?? "");
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const example = word.examples?.[0];
  const evaluation = saved?.evalResult;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = sentence.trim();
    if (trimmed.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await evaluateWritingSentence(word.id, trimmed);
      onEvaluated(trimmed, res);
    } catch {
      setError("Chưa chấm được câu lúc này. Bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-surface-2/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 lang="en" className="word-display text-3xl font-bold">
              {word.word}
            </h3>
            {word.pronunciation && (
              <span className="text-sm text-primary">{word.pronunciation}</span>
            )}
            <AudioButton src={word.audioUrl} text={word.word} />
          </div>
          {example && (
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-primary"
            >
              {showHint ? "Ẩn ví dụ gợi ý" : "Xem ví dụ gợi ý"}
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted">
          Nghĩa:{" "}
          <strong className="text-foreground">
            {word.meaningVi ?? word.meaningEn ?? "Đang cập nhật"}
          </strong>
        </p>
        {showHint && example && (
          <div className="mt-3 rounded-xl border border-primary/15 bg-surface p-3 text-sm">
            <p lang="en" className="font-medium">
              {example.en}
            </p>
            {example.vi && (
              <p className="mt-1 text-xs text-muted">{example.vi}</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <label htmlFor="sentence-input" className="block text-sm font-semibold">
          Câu tiếng Anh của bạn
        </label>
        <textarea
          id="sentence-input"
          lang="en"
          rows={3}
          maxLength={300}
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder={`Ví dụ: I use "${word.word}" in a short sentence…`}
          className="field resize-none"
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {sentence.trim().length}/300 ký tự
          </span>
          <Button type="submit" disabled={busy || sentence.trim().length < 3}>
            <Icon name="spark" size={16} />
            {busy ? "Đang chấm câu…" : "Chấm câu với AI"}
          </Button>
        </div>
      </form>

      {error && <ErrorNote>{error}</ErrorNote>}

      {evaluation && (
        <div
          role="status"
          className={`space-y-3 rounded-2xl border p-5 ${
            evaluation.score >= 75
              ? "border-good/25 bg-good/6"
              : "border-primary/20 bg-primary/5"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  evaluation.score >= 75
                    ? "bg-good/15 text-good"
                    : "bg-primary/12 text-primary"
                }`}
              >
                {evaluation.score}/100 điểm
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[11px] font-medium text-muted">
                {evaluation.aiPowered ? "AI Gemini" : "Kiểm tra tự động"}
              </span>
              {!evaluation.usedTargetWord && (
                <span className="rounded-lg bg-warn/15 px-2.5 py-1 text-[11px] font-medium text-warn">
                  Thiếu từ mục tiêu
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-muted">
              {evaluation.isNatural ? "Tự nhiên" : "Cần chỉnh nhẹ"}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3.5">
            <p className="text-[11px] font-semibold text-muted uppercase">
              Câu gợi ý tự nhiên hơn
            </p>
            <p lang="en" className="mt-1 text-base font-medium text-foreground">
              {evaluation.corrected}
            </p>
          </div>

          <p className="text-sm leading-6">{evaluation.feedbackVi}</p>
          <p className="text-xs leading-5 text-muted">
            <strong className="text-primary">Gợi ý:</strong> {evaluation.tipVi}
          </p>
        </div>
      )}
    </div>
  );
}
