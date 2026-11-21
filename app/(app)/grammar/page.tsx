"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  LearningHeader,
  LearningTip,
  LevelFilter,
} from "@/components/learning-library";
import styles from "@/components/learning-library.module.css";
import { useWordAudio } from "@/components/practice/use-word-audio";
import {
  Button,
  EmptyState,
  ErrorNote,
  LinkButton,
  SectionHeading,
  Spinner,
} from "@/components/ui";
import {
  InteractiveEnglishText,
  WordLookupPopover,
} from "@/components/word-lookup-popover";
import { useRequireAuth } from "@/lib/auth";
import { buildGrammarClozeQuestions } from "@/lib/grammar-cloze";
import { useGrammar, useGrammarLevels, useGrammarPoint } from "@/lib/hooks";
import { levelLabel } from "@/lib/levels";
import type { GrammarExample, GrammarListItem } from "@/lib/types";

function normalizeSearch(text: string) {
  return text
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export default function GrammarPage() {
  const { user, loading } = useRequireAuth();
  const levels = useGrammarLevels();
  const [level, setLevel] = useState<number | null>(null);
  const active = level ?? levels.data?.[0]?.level;
  const list = useGrammar(active);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const grouped = useMemo(() => {
    const term = normalizeSearch(query.trim());
    return (list.data ?? []).filter((point) =>
      normalizeSearch(
        `${point.titleEn} ${point.titleVi} ${point.summaryVi}`,
      ).includes(term),
    );
  }, [list.data, query]);

  if (loading || !user) return <Spinner />;

  return (
    <div className={`page-wrap ${styles.page}`}>
      <LearningHeader
        section="grammar"
        eyebrow="Khám phá tiếng Anh"
        title="Ngữ pháp & mẫu câu"
        description="Hiểu cấu trúc, nghe ví dụ và tập diễn đạt điều bạn muốn nói."
      >
        <LinkButton href="/vocabulary" variant="secondary">
          <Icon name="book" size={16} /> Khám phá từ vựng
        </LinkButton>
      </LearningHeader>

      {levels.error ? (
        <ErrorNote>
          Chưa tải được danh sách ngữ pháp.{" "}
          <button
            className="font-semibold underline"
            onClick={() => void levels.mutate()}
          >
            Thử lại
          </button>
        </ErrorNote>
      ) : levels.isLoading ? (
        <Spinner />
      ) : !levels.data?.length ? (
        <EmptyState
          title="Chưa có nội dung ngữ pháp"
          description="Nội dung đang được biên soạn."
        />
      ) : (
        <>
          <section
            className={styles.toolbar}
            aria-label="Tìm kiếm và lọc ngữ pháp"
          >
            <div className={styles.toolbarTop}>
              <p className={styles.toolbarLabel}>Bạn đang học ở cấp độ nào?</p>
              <div className={`${styles.searchInput} ${styles.grammarSearch}`}>
                <Icon name="search" size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="field"
                  placeholder="Tìm cấu trúc, tên tiếng Anh, nghĩa…"
                  aria-label="Tìm ngữ pháp trong cấp đang chọn"
                  type="search"
                />
              </div>
            </div>
            <LevelFilter
              options={levels.data.map((item) => ({
                value: item.level,
                label: levelLabel(item.level),
                count: item.count,
              }))}
              value={active}
              onChange={(value) => {
                setLevel(value ?? null);
                setOpenSlug(null);
              }}
            />
          </section>
          <div className={styles.contentColumns}>
            <section
              className={styles.contentMain}
              aria-label="Danh sách ngữ pháp"
            >
              <SectionHeading
                icon="cards"
                title={active ? `Ngữ pháp ${levelLabel(active)}` : "Ngữ pháp"}
                description="Chọn một cấu trúc để khám phá"
                tone="lavender"
              >
                <span className={styles.count} aria-live="polite">
                  {grouped.length} cấu trúc
                </span>
              </SectionHeading>
              {list.isLoading ? (
                <Spinner />
              ) : list.error ? (
                <ErrorNote>
                  Chưa tải được ngữ pháp cấp này.{" "}
                  <button
                    className="font-semibold underline"
                    onClick={() => void list.mutate()}
                  >
                    Thử lại
                  </button>
                </ErrorNote>
              ) : !grouped.length ? (
                <EmptyState
                  title={
                    query
                      ? "Chưa tìm thấy cấu trúc phù hợp"
                      : "Chưa có ngữ pháp ở cấp này"
                  }
                  description={
                    query
                      ? "Thử từ khóa khác hoặc chọn một cấp độ khác."
                      : "Hãy chọn một cấp độ khác để tiếp tục học."
                  }
                >
                  {query && (
                    <Button variant="secondary" onClick={() => setQuery("")}>
                      Xóa tìm kiếm
                    </Button>
                  )}
                </EmptyState>
              ) : (
                <div className={styles.grammarList}>
                  {grouped
                    .filter((point) => !point.flat)
                    .map((point, index) => (
                      <GrammarRow
                        key={point.slug}
                        point={point}
                        index={index}
                        open={openSlug === point.slug}
                        onWordClick={setLookupWord}
                        selectedWord={lookupWord}
                        onToggle={() =>
                          setOpenSlug((current) =>
                            current === point.slug ? null : point.slug,
                          )
                        }
                      />
                    ))}
                  {grouped.some((point) => point.flat) && (
                    <details
                      open={
                        grouped.every((point) => point.flat) || !!query.trim()
                      }
                      className={styles.grammarRow}
                    >
                      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold">
                        <Icon
                          name="book"
                          size={16}
                          className="mr-2 inline text-primary"
                        />
                        Tham khảo nhanh ·{" "}
                        {grouped.filter((point) => point.flat).length} mục
                      </summary>
                      <ul className="divide-y divide-border border-t border-border">
                        {grouped
                          .filter((point) => point.flat)
                          .map((point) => (
                            <li
                              key={point.slug}
                              className="flex items-start gap-3 px-5 py-4"
                            >
                              <span className="min-w-0">
                                <span className={styles.grammarTitle}>
                                  {point.titleVi}
                                  <GrammarTitleEn title={point.titleEn} />
                                </span>
                                <span className={styles.grammarSummary}>
                                  {point.summaryVi}
                                </span>
                              </span>
                            </li>
                          ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </section>
            <aside className={styles.aside}>
              <div className={styles.sideCard}>
                <span className={`${styles.badge} mb-4`}>
                  <Icon name="spark" size={12} /> HỌC MỘT CHÚT, NHỚ LÂU HƠN
                </span>
                <h2>3 bước để dùng được một mẫu câu</h2>
                <ol className={styles.steps}>
                  {[
                    [
                      "Hiểu cấu trúc",
                      "Đọc giải thích và chú ý vị trí của từng thành phần trong câu.",
                    ],
                    [
                      "Nghe & đọc theo",
                      "Nghe ví dụ, đọc theo từng câu rồi thử nói lại khi ẩn bản dịch.",
                    ],
                    [
                      "Đặt câu của bạn",
                      "Thay từ trong ví dụ bằng người, vật hoặc hoạt động quen thuộc.",
                    ],
                  ].map(([title, text], index) => (
                    <li key={title}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <div>
                        <strong>{title}</strong>
                        {text}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <LearningTip title="Từ vựng và ngữ pháp đi cùng nhau">
                Một cấu trúc quen sẽ dễ nhớ hơn khi dùng với những từ bạn vừa
                học.
                <Link href="/vocabulary">
                  Mở thư viện từ vựng <Icon name="arrow" size={14} />
                </Link>
              </LearningTip>
            </aside>
          </div>
        </>
      )}
      <WordLookupPopover
        word={lookupWord}
        onClose={() => setLookupWord(null)}
      />
    </div>
  );
}

/** Two-digit position shown in the tile at the start of each grammar row. */
function rowNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function GrammarTitleEn({ title }: { title: string }) {
  return (
    <span lang="en" className="ml-1.5 font-normal text-muted">
      · {title}
    </span>
  );
}

function GrammarRow({
  point,
  index,
  open,
  onToggle,
  onWordClick,
  selectedWord,
}: {
  point: GrammarListItem;
  index: number;
  open: boolean;
  onToggle: () => void;
  onWordClick: (word: string) => void;
  selectedWord: string | null;
}) {
  const detail = useGrammarPoint(open ? point.slug : null);

  return (
    <article className={styles.grammarRow}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`grammar-${point.slug}`}
        id={`grammar-trigger-${point.slug}`}
        className={styles.grammarTrigger}
      >
        <span
          className={`word-display ${styles.grammarCharacter}`}
          aria-hidden="true"
        >
          {rowNumber(index)}
        </span>
        <span className="min-w-0 flex-1">
          <span className={styles.grammarTitle}>
            {point.titleVi}
            <GrammarTitleEn title={point.titleEn} />
          </span>
          <span className={styles.grammarSummary}>{point.summaryVi}</span>
        </span>
        <span className={styles.grammarArrow}>
          <Icon name="chevron" size={14} />
        </span>
      </button>

      {open && (
        <div
          id={`grammar-${point.slug}`}
          role="region"
          aria-labelledby={`grammar-trigger-${point.slug}`}
          className={styles.grammarDetail}
        >
          {detail.isLoading ? (
            <Spinner />
          ) : detail.error || !detail.data ? (
            <ErrorNote>
              Chưa tải được chi tiết.{" "}
              <button
                onClick={() => void detail.mutate()}
                className="font-semibold underline"
              >
                Thử lại
              </button>
            </ErrorNote>
          ) : (
            <div className="space-y-5">
              <p className="whitespace-pre-line text-sm leading-7">
                {detail.data.explanationVi}
              </p>

              {detail.data.patterns.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">CẤU TRÚC</p>
                  <ul className="space-y-1.5">
                    {detail.data.patterns.map((pattern) => (
                      <li
                        key={pattern}
                        className="word-display rounded-lg bg-surface-2 px-3 py-2 text-sm"
                      >
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="eyebrow mb-2">VÍ DỤ (BẤM VÀO TỪ ĐỂ TRA NHANH)</p>
                <div className="space-y-2.5">
                  {detail.data.examples.map((example, i) => (
                    <ExampleRow
                      key={i}
                      example={example}
                      onWordClick={onWordClick}
                      selectedWord={selectedWord}
                    />
                  ))}
                </div>
              </div>

              <GrammarClozePractice examples={detail.data.examples} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function ExampleRow({
  example,
  onWordClick,
  selectedWord,
}: {
  example: GrammarExample;
  onWordClick: (word: string) => void;
  selectedWord: string | null;
}) {
  const audio = useWordAudio(example.en);
  const [showTranslation, setShowTranslation] = useState(true);

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => void audio.play()}
          disabled={audio.playing}
          aria-label="Nghe câu"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          <Icon name={audio.playing ? "pause" : "sound"} size={15} />
        </button>
        <div className="min-w-0">
          <p lang="en" className="word-display text-base leading-snug">
            <InteractiveEnglishText
              text={example.en}
              selectedWord={selectedWord}
              onWordClick={onWordClick}
            />
          </p>
          {showTranslation && (
            <p className="mt-1 text-sm text-muted">{example.vi}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          aria-pressed={showTranslation}
          className="ml-auto min-h-10 shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-muted hover:bg-surface-2"
        >
          {showTranslation ? "Ẩn bản dịch" : "Bản dịch"}
        </button>
      </div>
    </div>
  );
}

function GrammarClozePractice({ examples }: { examples: GrammarExample[] }) {
  const questions = useMemo(
    () => buildGrammarClozeQuestions(examples, 4),
    [examples],
  );
  const [picked, setPicked] = useState<Record<number, string>>({});

  if (questions.length === 0) return null;

  const answeredCount = Object.keys(picked).length;
  const correctCount = questions.filter(
    (q) => picked[q.index] === q.answer,
  ).length;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow text-primary">LUYỆN TẬP NHANH · ĐIỀN TỪ</p>
          <p className="text-xs text-muted">
            Chọn từ phù hợp nhất để hoàn thành các mẫu câu vừa học.
          </p>
        </div>
        {answeredCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-primary">
              Đúng {correctCount}/{questions.length}
            </span>
            <button
              type="button"
              onClick={() => setPicked({})}
              className="text-xs font-medium text-muted hover:text-primary hover:underline"
            >
              Làm lại
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {questions.map((q) => {
          const chosen = picked[q.index];
          const isAnswered = chosen !== undefined;
          const isRight = chosen === q.answer;
          return (
            <div
              key={q.index}
              className="rounded-xl border border-border bg-surface p-3.5"
            >
              <p lang="en" className="word-display text-sm leading-relaxed">
                {q.before}
                <span
                  className={`mx-1 inline-block min-w-14 rounded-md border px-2 py-0.5 text-center font-bold ${
                    !isAnswered
                      ? "border-dashed border-primary/40 bg-primary/5 text-primary"
                      : isRight
                        ? "border-good bg-good/10 text-good"
                        : "border-danger bg-danger/10 text-danger"
                  }`}
                >
                  {isAnswered ? chosen : "____"}
                </span>
                {q.after}
              </p>
              {q.vi && <p className="mt-1 text-xs text-muted">{q.vi}</p>}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const isThisChosen = chosen === opt;
                  const isThisCorrect = isAnswered && opt === q.answer;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswered}
                      onClick={() =>
                        setPicked((prev) => ({ ...prev, [q.index]: opt }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isThisCorrect
                          ? "border-good bg-good/10 text-good"
                          : isThisChosen && !isRight
                            ? "border-danger bg-danger/10 text-danger"
                            : "border-border bg-surface-2 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {isAnswered && !isRight && (
                <p className="mt-2 text-xs text-good">
                  Đáp án đúng: <strong lang="en">{q.answer}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
