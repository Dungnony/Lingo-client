"use client";

import { Suspense, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { FeatureTour, type TourStep } from "@/components/feature-tour";
import { Icon } from "@/components/icon";
import { LearningJourney } from "@/components/learning-journey";
import { LessonPath } from "@/components/lesson-path";
import { SelectionGroup } from "@/components/selection-group";
import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  LinkButton,
  PageHeading,
  ProgressBar,
  SectionHeading,
  Spinner,
} from "@/components/ui";
import { useRequireAuth } from "@/lib/auth";
import { skipLesson, useLearnPath } from "@/lib/hooks";
import { groupLessonsByTopic } from "@/lib/learn-topics";
import { isValidLevel, levelLabel } from "@/lib/levels";
import styles from "./learn.module.css";

const LEARN_TOUR_STEPS: TourStep[] = [
  {
    icon: "route",
    title: "Chọn cấp độ phù hợp",
    description:
      "Chuyển tự do giữa 6 cấp (Beginner → Advanced) bất cứ lúc nào — cấp đề xuất từ khảo sát ban đầu đã được mở sẵn.",
  },
  {
    icon: "spark",
    title: "Học theo chủ đề & Vượt nhanh",
    description:
      "Các bài học được gom theo từng chủ đề và mở khóa sẵn hoàn toàn. Tự do chọn chủ đề muốn học hoặc bấm \"Vượt nhanh\" (5 câu) để qua các phần bạn đã biết.",
  },
  {
    icon: "cards",
    title: "Vào thẳng Flashcard trong 1 chạm",
    description:
      "Bấm \"Học flashcard ngay\" để vào luyện thẻ ghi nhớ tức thì, hoặc bấm \"Đã biết\" để đi tiếp sang bài kế tiếp.",
  },
];

function LearnContent({ initialLevel }: { initialLevel?: number }) {
  const { user, loading } = useRequireAuth();
  const [level, setLevel] = useState<number | undefined>(initialLevel);
  const { data, isLoading, error, mutate } = useLearnPath(level);
  const [skippingHero, setSkippingHero] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);

  if (loading || !user) return <Spinner />;

  const activeLevel = level ?? data?.level;
  const pct = data?.totalLessons
    ? Math.min(
        100,
        Math.max(0, (data.completedLessons / data.totalLessons) * 100),
      )
    : 0;
  const currentLesson =
    data?.lessons.find((lesson) => lesson.id === data.currentLessonId) ??
    data?.lessons.find(
      (lesson) =>
        lesson.status === "IN_PROGRESS" || lesson.status === "AVAILABLE",
    );
  const totalWords =
    data?.lessons.reduce((total, lesson) => total + lesson.wordCount, 0) ?? 0;
  const topicCount = data?.lessons
    ? groupLessonsByTopic(data.lessons).length
    : 0;
  // Giữ bố cục khi đổi cấp, chặn bài cũ đến khi dữ liệu mới tải xong.
  const switchingLevel = isLoading && !!data;

  async function handleSkipCurrent() {
    if (!currentLesson || skippingHero) return;
    setSkippingHero(true);
    setHeroError(null);
    try {
      await skipLesson(currentLesson.id);
      await mutate();
    } catch {
      setHeroError("Chưa bỏ qua được bài này. Bạn thử lại nhé.");
    } finally {
      setSkippingHero(false);
    }
  }

  return (
    <div className={`page-wrap ${styles.page}`}>
      <FeatureTour tourKey="learn" steps={LEARN_TOUR_STEPS} />
      <PageHeading
        icon="route"
        eyebrow="Lộ trình học"
        title="Học đúng tốc độ của bạn"
        description="Mọi chủ đề đều mở sẵn. Học từng bước hoặc vượt nhanh qua những phần bạn đã quen thuộc."
      >
        <LinkButton href="/study" variant="secondary">
          <Icon name="cards" size={17} /> Ôn tập hôm nay
        </LinkButton>
      </PageHeading>

      {data && data.lessons.length > 0 && !error && (
        <section
          className={styles.continueCard}
          aria-label="Tiếp tục hành trình"
          aria-busy={switchingLevel}
          inert={switchingLevel}
        >
          <div className={styles.continueCopy}>
            <span className={styles.continueLabel}>
              <span />{" "}
              {currentLesson
                ? "BƯỚC TIẾP THEO CỦA BẠN"
                : "MỘT CHẶNG ĐƯỜNG ĐÁNG NHỚ"}
            </span>
            <h2>
              {currentLesson?.title ?? `Bạn đã hoàn thành ${data.levelName}`}
            </h2>
            <p>
              {currentLesson
                ? `${currentLesson.wordCount} từ vựng trong bài này. Vào thẳng flashcard hoặc đánh dấu đã biết để đi nhanh hơn.`
                : "Ôn lại những từ đã học hoặc chọn một cấp độ mới để tiếp tục khám phá."}
            </p>
            {currentLesson && currentLesson.previewWords.length > 0 && (
              <p lang="en" className={`mt-2 word-display ${styles.previewWords}`}>
                {currentLesson.previewWords.slice(0, 4).join(" · ")}
              </p>
            )}
            <div className={styles.continueActions}>
              <LinkButton
                href={
                  currentLesson
                    ? `/study?lesson=${currentLesson.id}&quick=1`
                    : "/study"
                }
              >
                {currentLesson ? "Học flashcard ngay" : "Ôn lại từ đã học"}
                <Icon name="arrow" size={16} />
              </LinkButton>
              {currentLesson && (
                <>
                  <LinkButton
                    href={`/learn/${currentLesson.id}`}
                    variant="secondary"
                  >
                    <Icon name="book" size={16} /> Xem danh sách từ
                  </LinkButton>
                  <Button
                    variant="ghost"
                    disabled={skippingHero}
                    onClick={() => void handleSkipCurrent()}
                  >
                    <Icon name="check" size={16} />
                    {skippingHero ? "Đang bỏ qua…" : "Đã biết · Qua bài này"}
                  </Button>
                </>
              )}
            </div>
            {heroError && <p className="mt-2 text-xs text-danger">{heroError}</p>}
          </div>
          <div className={styles.progressTile}>
            <div
              className={styles.progressRing}
              style={{ "--progress": `${pct}%` } as CSSProperties}
              aria-hidden="true"
            >
              <span lang="en" className="word-display">
                Aa
              </span>
            </div>
            <div>
              <p className={styles.progressLevel}>
                {levelLabel(data.level)}
              </p>
              <p className={styles.progressValue}>
                {Math.round(pct)}% <span>hoàn thành</span>
              </p>
              <p className={styles.progressCount}>
                {data.completedLessons}/{data.totalLessons} bài học
              </p>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="level-lessons-heading" className={styles.course}>
        <SectionHeading
          id="level-lessons-heading"
          icon="route"
          title="Lộ trình theo cấp độ"
          description="Chọn chủ đề muốn học, hoặc làm 5 câu kiểm tra nhanh để vượt qua phần bạn đã biết."
        >
          {!!data?.levels.length && (
            <SelectionGroup
              label="Chọn cấp độ"
              value={activeLevel}
              className={styles.levels}
            >
              {data.levels.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLevel(item)}
                  aria-pressed={activeLevel === item}
                  className={styles.level}
                >
                  {`Level ${item}`}
                </button>
              ))}
            </SelectionGroup>
          )}
        </SectionHeading>

        {data && !error && data.lessons.length > 0 && (
          <div className={styles.fastTrackBanner}>
            <p className="flex items-start gap-2.5 text-xs leading-5 text-muted sm:items-center">
              <Icon
                name="spark"
                size={16}
                className="mt-0.5 shrink-0 text-primary sm:mt-0"
              />
              <span>
                Mấy bài đầu quá dễ? Tự do chọn bất kỳ chủ đề nào, bấm{" "}
                <strong className="text-foreground">Vượt nhanh</strong> (5 câu)
                để qua cả chủ đề, hoặc chuyển thẳng lên cấp độ cao hơn.
              </span>
            </p>
            {data.level < 6 && (
              <Button
                variant="secondary"
                onClick={() => setLevel(data.level + 1)}
                className="min-h-9! shrink-0 px-3! py-1.5! text-xs!"
              >
                Chuyển sang Level {data.level + 1}
                <Icon name="arrow" size={14} />
              </Button>
            )}
          </div>
        )}

        {error ? (
          <Card className="space-y-4">
            <ErrorNote>Chưa tải được lộ trình học. Vui lòng thử lại.</ErrorNote>
            <Button variant="secondary" onClick={() => void mutate()}>
              <Icon name="refresh" size={16} /> Tải lại lộ trình
            </Button>
          </Card>
        ) : !data ? (
          <div role="status" className={styles.skeleton}>
            <span className="sr-only">Đang tải lộ trình học…</span>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : !data.lessons.length ? (
          <EmptyState
            title="Bài học đang được chuẩn bị"
            description="Cấp độ này chưa có bài học. Bạn có thể chọn cấp độ khác hoặc khám phá thư viện từ vựng."
          >
            <LinkButton href="/vocabulary">
              Khám phá từ vựng <Icon name="arrow" size={16} />
            </LinkButton>
          </EmptyState>
        ) : (
          <div className={styles.courseBody} aria-busy={isLoading}>
            {switchingLevel && (
              <span role="status" className={styles.loadingNote}>
                Đang tải Level {activeLevel}…
              </span>
            )}
            <div
              className={styles.courseGrid}
              data-loading={switchingLevel || undefined}
              inert={switchingLevel}
            >
              <div className="min-w-0 space-y-4">
                <div className={styles.lessonHeading}>
                  <span>
                    <Icon name="book" size={16} /> {data.levelName}
                  </span>
                  <span>
                    {topicCount} chủ đề · {data.totalLessons} bài học
                  </span>
                </div>
                <LessonPath
                  lessons={data.lessons}
                  currentLessonId={data.currentLessonId}
                  onMutate={mutate}
                />
              </div>
              <aside className={styles.sidebar}>
                <Card>
                  <p className={styles.asideLabel}>
                    <Icon name="chart" size={16} /> TIẾN ĐỘ CỦA BẠN
                  </p>
                  <div className={styles.stats}>
                    <div>
                      <strong>
                        {data.completedLessons}
                        <span>/{data.totalLessons}</span>
                      </strong>
                      <p>Bài đã hoàn thành</p>
                    </div>
                    <div>
                      <strong>{totalWords.toLocaleString("vi-VN")}</strong>
                      <p>Từ trong lộ trình</p>
                    </div>
                  </div>
                  <ProgressBar value={pct} label="Tiến độ cấp độ" />
                  <LinkButton
                    href="/progress"
                    variant="ghost"
                    className="mt-3 -ml-4"
                  >
                    Xem tiến độ <Icon name="arrow" size={15} />
                  </LinkButton>
                </Card>
                <div className={styles.tip}>
                  <span className="icon-tile shrink-0">
                    <Icon name="spark" size={20} />
                  </span>
                  <div>
                    <h3>Tăng tốc linh hoạt</h3>
                    <p>
                      Bấm <strong>Đã biết</strong> ở từng bài hoặc làm 5 câu{" "}
                      <strong>Vượt nhanh</strong> ở từng chủ đề để đi thẳng tới
                      phần từ vựng mới với bạn.
                    </p>
                  </div>
                </div>
                <LinkButton
                  href="/exams"
                  variant="secondary"
                  className="w-full"
                >
                  <Icon name="target" size={16} /> Thử sức với bài kiểm tra
                </LinkButton>
              </aside>
            </div>
          </div>
        )}
      </section>

      <LearningJourney />
    </div>
  );
}

function LearnRoute() {
  const value = Number(useSearchParams().get("level"));
  const level =
    isValidLevel(value) ? value : undefined;
  return <LearnContent key={level ?? "default"} initialLevel={level} />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LearnRoute />
    </Suspense>
  );
}
