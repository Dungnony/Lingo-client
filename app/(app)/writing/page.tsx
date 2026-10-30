"use client";

import { useState } from "react";
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
import { recordPracticeAttempt, usePracticeStats } from "@/lib/hooks";
import type { Word } from "@/lib/types";

const PLAYBACK_RATES = [0.75, 1] as const;

export default function WritingPage() {
  return (
    <PracticeLibrary
      skill="writing"
      title="Luyện chính tả"
      description="Nghe một câu ví dụ, gõ lại thật chính xác rồi xem từng từ đúng hay sai."
      startSteps={[
        "Nhấn nút loa để nghe câu — có thể nghe chậm lại.",
        "Gõ lại cả câu bạn nghe được vào ô bên dưới rồi kiểm tra.",
        "Từ sai được đánh dấu đỏ; đọc lại câu đúng và nghĩa trước khi sang câu sau.",
      ]}
    >
      {(words) => <DictationSession words={words} />}
    </PracticeLibrary>
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
          Nhóm từ này chưa có câu ví dụ để luyện chính tả. Hãy chọn nhóm khác.
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
              title="Luyện chính tả"
              tone="lavender"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-semibold">
                  {stats.data.totalAttempts.toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-muted">câu đã chép</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">
                  {stats.data.accuracyPct ?? 0}%
                </p>
                <p className="text-xs text-muted">chép đúng hoàn toàn</p>
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
