"use client";

import { useState } from "react";
import {
  Button,
  EmptyState,
  ErrorNote,
  LinkButton,
  PageHeading,
  SectionHeading,
  Spinner,
} from "@/components/ui";
import styles from "@/components/learning-library.module.css";
import { Icon } from "@/components/icon";
import { AudioButton } from "@/components/audio-button";
import { ReportWordButton } from "@/components/report-word-button";
import { SaveWordButton } from "@/components/save-word-button";
import { SelectionGroup } from "@/components/selection-group";
import { QuizRunner } from "@/components/quiz-runner";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { useNotebook } from "@/lib/hooks";
import { levelLabel } from "@/lib/levels";
import type { NotebookTab, NotebookWord, Quiz } from "@/lib/types";

const TABS: { value: NotebookTab; label: string; description: string }[] = [
  {
    value: "saved",
    label: "Đã lưu",
    description: "Những từ bạn đã bấm ♥ ở thư viện, bài học hoặc flashcard.",
  },
  {
    value: "difficult",
    label: "Hay sai",
    description: "Những từ bạn đã quên từ 2 lần trở lên khi ôn flashcard.",
  },
];

/** The quiz API needs at least this many words with a Vietnamese meaning. */
const QUIZ_MIN_WORDS = 4;
const QUIZ_MAX_QUESTIONS = 10;

export default function NotebookPage() {
  const { user, loading } = useRequireAuth();
  const [tab, setTab] = useState<NotebookTab>("saved");
  const [page, setPage] = useState(1);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const list = useNotebook(tab, page);
  if (loading || !user) return <Spinner />;

  const items = list.data?.items ?? [];
  const quizWordIds = items.filter((w) => w.meaningVi).map((w) => w.id);
  const activeTab = TABS.find((t) => t.value === tab) ?? TABS[0];

  function selectTab(next: NotebookTab) {
    setTab(next);
    setPage(1);
    resetQuiz();
  }

  function resetQuiz() {
    setQuiz(null);
    setQuizScore(null);
    setQuizError(null);
  }

  function onUnsaved() {
    // Removing the last word of a page would otherwise leave an empty page.
    if (tab === "saved" && items.length === 1 && page > 1) setPage(page - 1);
    void list.mutate();
  }

  async function startQuiz() {
    setQuizBusy(true);
    setQuizError(null);
    try {
      const generated = await api.post<Quiz>("/quiz/generate", {
        wordIds: quizWordIds,
        size: Math.min(QUIZ_MAX_QUESTIONS, quizWordIds.length),
      });
      setQuizScore(null);
      setQuiz(generated);
    } catch (e) {
      setQuizError(
        e instanceof ApiError ? e.message : "Chưa tạo được bài kiểm tra.",
      );
    } finally {
      setQuizBusy(false);
    }
  }

  if (quiz) {
    return (
      <div className={`page-wrap ${styles.page}`}>
        <PageHeading
          icon="heart"
          eyebrow="Sổ tay từ vựng"
          title="Kiểm tra các từ trong sổ tay"
          description="Chọn nghĩa tiếng Việt đúng cho mỗi từ."
        />
        {quizScore === null ? (
          <QuizRunner
            key={quiz.attemptId}
            quiz={quiz}
            onDone={(score) => setQuizScore(score)}
          />
        ) : (
          <EmptyState
            title={`Bạn đạt ${quizScore}%`}
            description="Kết quả đã được lưu. Hãy ôn lại những từ còn sai rồi thử lần nữa nhé."
          >
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={resetQuiz}>
                <Icon name="back" size={16} />
                Về sổ tay
              </Button>
              <Button onClick={() => void startQuiz()} disabled={quizBusy}>
                <Icon name="refresh" size={16} />
                Làm lại
              </Button>
            </div>
          </EmptyState>
        )}
      </div>
    );
  }

  return (
    <div className={`page-wrap ${styles.page}`}>
      <PageHeading
        icon="heart"
        eyebrow="Của riêng bạn"
        title="Sổ tay từ vựng"
        description="Gom những từ bạn muốn nhớ và những từ hay quên để ôn lại thật nhanh."
      >
        <LinkButton href="/study?notebook=1" variant="secondary">
          <Icon name="cards" size={17} />
          Ôn bằng flashcard
        </LinkButton>
        <Button
          onClick={() => void startQuiz()}
          disabled={quizBusy || quizWordIds.length < QUIZ_MIN_WORDS}
          title={
            quizWordIds.length < QUIZ_MIN_WORDS
              ? `Cần ít nhất ${QUIZ_MIN_WORDS} từ có nghĩa tiếng Việt`
              : undefined
          }
        >
          <Icon name="target" size={17} />
          {quizBusy ? "Đang tạo…" : "Kiểm tra các từ này"}
        </Button>
      </PageHeading>

      <section className={styles.toolbar} aria-label="Chọn danh sách">
        <SelectionGroup
          className={styles.levels}
          label="Danh sách trong sổ tay"
          value={tab}
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={tab === t.value}
              onClick={() => selectTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </SelectionGroup>
      </section>

      {quizError && <ErrorNote>{quizError}</ErrorNote>}

      <SectionHeading
        icon={tab === "saved" ? "heart" : "refresh"}
        title={activeTab.label}
        description={activeTab.description}
      >
        {list.data && (
          <span className={styles.count}>
            {list.data.total.toLocaleString("vi-VN")} từ
          </span>
        )}
      </SectionHeading>

      {list.error ? (
        <ErrorNote>
          Chưa tải được sổ tay.{" "}
          <button
            onClick={() => void list.mutate()}
            className="font-semibold underline"
          >
            Thử lại
          </button>
        </ErrorNote>
      ) : list.isLoading ? (
        <Spinner />
      ) : items.length ? (
        <>
          <div className={styles.wordGrid}>
            {items.map((w) => (
              <NotebookCard key={w.id} word={w} onUnsaved={onUnsaved} />
            ))}
          </div>
          {list.data && list.data.totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <Icon name="back" size={16} />
                Trước
              </Button>
              <span className="text-sm text-muted" aria-live="polite">
                Trang {page} / {list.data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= list.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
                <Icon name="arrow" size={16} />
              </Button>
            </div>
          )}
        </>
      ) : tab === "saved" ? (
        <EmptyState
          title="Sổ tay còn trống"
          description="Bấm biểu tượng ♥ cạnh một từ ở thư viện từ vựng, bài học hoặc flashcard để lưu vào đây."
        >
          <LinkButton href="/vocabulary" variant="secondary">
            Mở thư viện từ vựng
          </LinkButton>
        </EmptyState>
      ) : (
        <EmptyState
          title="Chưa có từ nào hay sai"
          description="Khi bạn chọn “Chưa nhớ” cho cùng một từ từ 2 lần trở lên, từ đó sẽ xuất hiện ở đây."
        >
          <LinkButton href="/study" variant="secondary">
            Ôn tập flashcard
          </LinkButton>
        </EmptyState>
      )}
    </div>
  );
}

function NotebookCard({
  word,
  onUnsaved,
}: {
  word: NotebookWord;
  onUnsaved: () => void;
}) {
  return (
    <article className={styles.wordCard}>
      <div className={styles.wordTop}>
        <span className={styles.badge}>{levelLabel(word.level)}</span>
        <span className="flex items-center gap-1">
          {word.lapses !== undefined && (
            <span className={styles.wordNumber}>Quên {word.lapses} lần</span>
          )}
          <SaveWordButton
            wordId={word.id}
            word={word.word}
            size={16}
            onChange={(saved) => {
              if (!saved) onUnsaved();
            }}
          />
          <ReportWordButton wordId={word.id} word={word.word} size={15} />
        </span>
      </div>
      <div className={styles.wordMain}>
        <h3 lang="en" className={`word-display ${styles.wordTile}`}>
          {word.word}
        </h3>
        <div className={styles.wordPronunciation}>
          {word.pronunciation && <p>{word.pronunciation}</p>}
          <span>
            <AudioButton
              src={word.audioUrl}
              text={word.word}
              size={16}
              className={styles.audioButton}
            />{" "}
            Nghe phát âm
          </span>
        </div>
      </div>
      <div className={styles.wordMeaning}>
        <p>
          {word.meaningVi ?? word.meaningEn ?? (
            <span className="italic text-muted">Nghĩa đang được cập nhật</span>
          )}
        </p>
      </div>
    </article>
  );
}
