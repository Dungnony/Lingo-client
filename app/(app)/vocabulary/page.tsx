"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  EmptyState,
  ErrorNote,
  LinkButton,
  SectionHeading,
  Spinner,
} from "@/components/ui";
import {
  LearningHeader,
  LearningTip,
  LevelFilter,
} from "@/components/learning-library";
import styles from "@/components/learning-library.module.css";
import { Icon } from "@/components/icon";
import { AudioButton } from "@/components/audio-button";
import { ReportWordButton } from "@/components/report-word-button";
import { SaveWordButton } from "@/components/save-word-button";
import { useRequireAuth } from "@/lib/auth";
import { useWords } from "@/lib/hooks";
import { LEVELS, levelLabel } from "@/lib/levels";
import { posLabel } from "@/lib/pos-labels";

function VocabularyContent() {
  const { user, loading } = useRequireAuth();
  const searchParams = useSearchParams();
  const initialLevel = Number(searchParams.get("level") ?? 1);
  const [level, setLevel] = useState<number | undefined>(
    LEVELS.includes(initialLevel) ? initialLevel : 1,
  );
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const words = useWords({ level, q: term, page });
  if (loading || !user) return <Spinner />;

  function selectLevel(next: number | undefined) {
    setLevel(next);
    setPage(1);
  }

  return (
    <div className={`page-wrap ${styles.page}`}>
      <LearningHeader
        section="vocabulary"
        eyebrow="Khám phá tiếng Anh"
        title="Thư viện từ vựng"
        description="Tra nghĩa, nghe phát âm và ghi nhớ từ mới theo cấp độ của bạn."
      >
        <LinkButton href="/study" variant="secondary">
          <Icon name="cards" size={17} />
          Ôn tập flashcard
        </LinkButton>
      </LearningHeader>
      <section className={styles.toolbar} aria-label="Tìm kiếm và lọc từ vựng">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTerm(q.trim());
            setPage(1);
          }}
          className={styles.search}
          role="search"
        >
          <div className={styles.searchInput}>
            <Icon
              name="search"
              className="absolute left-4 top-3.5 text-muted"
              size={19}
            />
            <input
              aria-label="Tìm từ vựng theo từ tiếng Anh hoặc nghĩa"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…"
              className="field pl-11!"
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </form>
        <p className={styles.filterHeading}>
          <Icon name="route" size={14} /> Chọn cấp độ của bạn
        </p>
        <LevelFilter
          options={[
            { value: undefined, label: "Tất cả" },
            ...LEVELS.map((value) => ({ value, label: levelLabel(value) })),
          ]}
          value={level}
          onChange={selectLevel}
        />
        <details className={styles.info}>
          <summary>
            <Icon name="info" size={16} />
            <span>
              Thư viện được sắp xếp theo <strong>6 cấp độ</strong> · Tìm hiểu về
              cấp độ
            </span>
            <Icon name="chevron" size={14} />
          </summary>
          <p>
            6 cấp của Lingo tương ứng khung tham chiếu châu Âu CEFR: Beginner = A1,
            Elementary = A2, Pre-Intermediate = B1, Intermediate = B2,
            Upper-Intermediate = C1, Advanced = C2. Chọn cấp phù hợp với vốn từ
            hiện tại và tăng dần khi bạn thấy tự tin hơn.
          </p>
        </details>
      </section>
      <SectionHeading
        icon="book"
        title={level ? `Từ vựng ${levelLabel(level)}` : "Tất cả từ vựng"}
        description={!term ? "Một từ mới, một bước tiến." : undefined}
      >
        {words.data && (
          <span className={styles.count}>
            {words.data.total.toLocaleString("vi-VN")} từ
          </span>
        )}
        {term && (
          <button
            onClick={() => {
              setQ("");
              setTerm("");
              setPage(1);
            }}
            className="flex items-center gap-2 text-xs text-muted"
          >
            Xóa tìm kiếm “{term}”<Icon name="close" size={14} />
          </button>
        )}
      </SectionHeading>
      {words.error ? (
        <ErrorNote>
          Chưa tải được từ vựng.{" "}
          <button
            onClick={() => void words.mutate()}
            className="font-semibold underline"
          >
            Thử lại
          </button>
        </ErrorNote>
      ) : words.isLoading ? (
        <Spinner />
      ) : words.data?.items.length ? (
        <>
          <div className={styles.wordGrid}>
            {words.data.items.map((w) => (
              <article key={w.id} className={styles.wordCard}>
                <div className={styles.wordTop}>
                  <span className={styles.badge}>Level {w.level}</span>
                  <span className="flex items-center gap-1">
                    <span className={styles.wordNumber}>
                      {posLabel(w.pos) || "Từ vựng"}
                    </span>
                    <SaveWordButton wordId={w.id} word={w.word} size={16} />
                    <ReportWordButton wordId={w.id} word={w.word} size={15} />
                  </span>
                </div>
                <div className={styles.wordMain}>
                  <h3 lang="en" className={`word-display ${styles.wordTile}`}>
                    {w.word}
                  </h3>
                  <div className={styles.wordPronunciation}>
                    {w.pronunciation && <p>{w.pronunciation}</p>}
                    <span>
                      <AudioButton
                        src={w.audioUrl}
                        text={w.word}
                        size={16}
                        className={styles.audioButton}
                      />{" "}
                      Nghe phát âm
                    </span>
                  </div>
                </div>
                <div className={styles.wordMeaning}>
                  <p>
                    {w.meaningVi ?? w.meaningEn ?? (
                      <span className="italic text-muted">
                        Nghĩa đang được cập nhật
                      </span>
                    )}
                  </p>
                  {!w.meaningVi && w.meaningEn && <span>Nghĩa tiếng Anh</span>}
                </div>
              </article>
            ))}
          </div>
          {words.data.totalPages > 1 && (
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
                Trang {page} / {words.data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= words.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
                <Icon name="arrow" size={16} />
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={
            term ? "Chưa tìm thấy từ phù hợp" : "Chưa có từ vựng ở cấp này"
          }
          description={
            term
              ? "Thử một từ hoặc nghĩa khác. Bạn cũng có thể tìm trong tất cả cấp độ."
              : "Hãy chọn cấp độ khác để tiếp tục khám phá."
          }
        >
          <Button
            variant="secondary"
            onClick={() => {
              setQ("");
              setTerm("");
              selectLevel(undefined);
            }}
          >
            Xem tất cả từ vựng
          </Button>
        </EmptyState>
      )}
      <LearningTip title="Nhớ từ lâu hơn bằng một câu ngắn">
        Nghe cách đọc, nói lại thành tiếng rồi đặt một câu của riêng bạn. Khi
        sẵn sàng, hãy dùng flashcard để ôn lại những từ đã học.
      </LearningTip>
    </div>
  );
}

export default function VocabularyPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <VocabularyContent />
    </Suspense>
  );
}
