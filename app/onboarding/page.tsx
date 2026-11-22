"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import {
  Button,
  Card,
  ErrorNote,
  PageHeading,
  ProgressBar,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/lib/auth";
import {
  fetchPlacementQuiz,
  submitOnboarding,
  useOnboarding,
} from "@/lib/hooks";
import { LEVELS, levelLabel, levelName } from "@/lib/levels";
import {
  computePlacementLevel,
  type PlacementAnswerResult,
} from "@/lib/placement";
import type {
  OnboardingGoal,
  OnboardingProfile,
  PlacementQuestion,
  SubmitOnboardingInput,
} from "@/lib/types";

const GOALS: { key: OnboardingGoal; label: string; icon: IconName }[] = [
  { key: "TRAVEL", label: "Du lịch, giao tiếp cơ bản", icon: "route" },
  { key: "WORK", label: "Phục vụ công việc", icon: "chart" },
  { key: "EXAM", label: "Thi IELTS, TOEIC…", icon: "trophy" },
  { key: "ACADEMIC", label: "Du học", icon: "book" },
  { key: "ENTERTAINMENT", label: "Xem phim, nghe nhạc", icon: "play" },
  { key: "INTEREST", label: "Sở thích, tìm hiểu văn hoá", icon: "heart" },
  { key: "OTHER", label: "Mục tiêu khác", icon: "spark" },
];

/** Khảo sát làm xong TRƯỚC khi có tài khoản (kiểu Duolingo) được giữ tạm ở
 * đây, đăng ký xong quay lại trang này thì tự nộp — xem hàm submit() trong
 * OnboardingWizard và effect tự nộp trong OnboardingPage. */
const PENDING_KEY = "lingo:pending-onboarding";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const onboarding = useOnboarding(Boolean(user));
  const [result, setResult] = useState<OnboardingProfile | null>(null);
  const [redo, setRedo] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [autoSubmitError, setAutoSubmitError] = useState<string | null>(null);

  // Vừa đăng ký xong từ luồng khảo sát ẩn danh -> tự nộp dữ liệu đã lưu tạm,
  // không bắt làm lại 3 bước.
  useEffect(() => {
    if (
      !user ||
      onboarding.isLoading ||
      onboarding.data ||
      result ||
      autoSubmitting
    )
      return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(PENDING_KEY);
    } catch {
      /* trình duyệt có thể chặn sessionStorage */
    }
    if (!raw) return;
    // Syncing with sessionStorage (an external system) is what effects are
    // for; reading it during render would differ between server and client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoSubmitting(true);
    submitOnboarding(JSON.parse(raw) as SubmitOnboardingInput)
      .then((profile) => setResult(profile))
      .catch(() =>
        setAutoSubmitError(
          "Chưa lưu được lộ trình vừa khảo sát — bạn làm lại giúp mình nhé.",
        ),
      )
      .finally(() => {
        try {
          sessionStorage.removeItem(PENDING_KEY);
        } catch {
          /* không sao, chỉ là dọn rác */
        }
        setAutoSubmitting(false);
      });
  }, [user, onboarding.isLoading, onboarding.data, result, autoSubmitting]);

  if (authLoading || (user && onboarding.isLoading) || autoSubmitting) {
    return (
      <OnboardingShell authenticated={Boolean(user)}>
        <Spinner />
      </OnboardingShell>
    );
  }

  const finalProfile = result ?? (!redo ? (onboarding.data ?? null) : null);

  return (
    <OnboardingShell authenticated={Boolean(user)}>
      {finalProfile ? (
        <ResultScreen
          profile={finalProfile}
          onRedo={() => {
            setResult(null);
            setRedo(true);
          }}
        />
      ) : (
        <OnboardingWizard
          authenticated={Boolean(user)}
          errorBanner={autoSubmitError}
          onDone={(profile) => {
            setResult(profile);
            setRedo(false);
          }}
        />
      )}
    </OnboardingShell>
  );
}

/** Khung tối giản, không mượn sidebar/topbar của app — kiểu quiz Duolingo,
 * tập trung, không phân tán chú ý trước khi có tài khoản. */
function OnboardingShell({
  authenticated,
  children,
}: {
  authenticated: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface">
        <div className="page-wrap flex items-center justify-between py-4!">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/favicon.ico"
              alt=""
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-base font-bold tracking-tight">
              Lingo<span className="text-primary">.</span>
            </span>
          </Link>
          {authenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted hover:text-primary"
            >
              Bỏ qua, làm sau
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-primary"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          )}
        </div>
      </div>
      <div className="py-8">{children}</div>
    </div>
  );
}

type Step = 1 | 2 | 3;

function OnboardingWizard({
  authenticated,
  errorBanner,
  onDone,
}: {
  authenticated: boolean;
  errorBanner: string | null;
  onDone: (profile: OnboardingProfile) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [hasStudiedBefore, setHasStudiedBefore] = useState<boolean | null>(
    null,
  );
  const [selfAssessedLevel, setSelfAssessedLevel] = useState<number | null>(
    null,
  );
  const [goal, setGoal] = useState<OnboardingGoal | null>(null);
  const [plansToTakeExam, setPlansToTakeExam] = useState<boolean | null>(
    null,
  );
  const [targetLevel, setTargetLevel] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [placementOpen, setPlacementOpen] = useState(false);
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState<string | null>(null);
  const [placementQuestions, setPlacementQuestions] = useState<
    PlacementQuestion[]
  >([]);
  const [pIdx, setPIdx] = useState(0);
  const [pPicked, setPPicked] = useState<string | null>(null);
  const [pResults, setPResults] = useState<PlacementAnswerResult[]>([]);
  const [placementSummary, setPlacementSummary] = useState<{
    recommendedLevel: number;
    correctCount: number;
    total: number;
  } | null>(null);
  const placementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (placementTimer.current) clearTimeout(placementTimer.current);
    };
  }, []);

  async function startPlacementTest() {
    if (placementTimer.current) clearTimeout(placementTimer.current);
    setPlacementOpen(true);
    setPLoading(true);
    setPError(null);
    setPIdx(0);
    setPPicked(null);
    setPResults([]);
    try {
      const data = await fetchPlacementQuiz();
      if (!data.questions.length) {
        setPError("Chưa tải được câu hỏi kiểm tra nhanh.");
      } else {
        setPlacementQuestions(data.questions);
      }
    } catch {
      setPError("Chưa tải được bài test xếp cấp. Bạn thử lại hoặc tự chọn nhé.");
    } finally {
      setPLoading(false);
    }
  }

  const activePlacementQ = placementOpen ? placementQuestions[pIdx] : undefined;

  const pickPlacementOption = useCallback(
    (option: string) => {
      if (!activePlacementQ || pPicked !== null) return;
      setPPicked(option);
      const nextResults = [
        ...pResults,
        {
          level: activePlacementQ.level,
          isCorrect: option === activePlacementQ.answer,
        },
      ];
      if (placementTimer.current) clearTimeout(placementTimer.current);
      placementTimer.current = setTimeout(() => {
        if (pIdx + 1 < placementQuestions.length) {
          setPResults(nextResults);
          setPPicked(null);
          setPIdx(pIdx + 1);
        } else {
          const summary = computePlacementLevel(nextResults);
          setPlacementSummary(summary);
          setHasStudiedBefore(summary.recommendedLevel > 1);
          setSelfAssessedLevel(
            summary.recommendedLevel > 1 ? summary.recommendedLevel : null,
          );
          setPlacementOpen(false);
          setPPicked(null);
        }
      }, 260);
    },
    [activePlacementQ, pIdx, pPicked, pResults, placementQuestions.length],
  );

  useEffect(() => {
    if (
      !placementOpen ||
      pLoading ||
      !activePlacementQ ||
      pPicked !== null
    ) {
      return;
    }
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
      const option = activePlacementQ?.options[Number(e.key) - 1];
      if (option) {
        e.preventDefault();
        pickPlacementOption(option);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePlacementQ, pLoading, pPicked, pickPlacementOption, placementOpen]);

  async function submit() {
    if (hasStudiedBefore === null || !goal || plansToTakeExam === null)
      return;
    const input: SubmitOnboardingInput = {
      hasStudiedBefore,
      selfAssessedLevel: hasStudiedBefore
        ? (selfAssessedLevel ?? undefined)
        : undefined,
      goal,
      plansToTakeExam,
      targetLevel: plansToTakeExam ? (targetLevel ?? undefined) : undefined,
      targetDate: plansToTakeExam && targetDate ? targetDate : undefined,
    };
    setBusy(true);
    setError(null);
    try {
      if (authenticated) {
        const profile = await submitOnboarding(input);
        onDone(profile);
      } else {
        // Chưa có tài khoản: lưu tạm rồi qua đăng ký, đăng ký xong quay lại
        // trang này (xem effect tự nộp trong OnboardingPage) mới thật sự lưu.
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(input));
        router.push("/register");
      }
    } catch {
      setError("Chưa lưu được khảo sát. Bạn thử lại nhé.");
      setBusy(false);
    }
  }

  return (
    <div className="page-wrap max-w-2xl space-y-6">
      <PageHeading
        icon="route"
        eyebrow="1 phút để Lingo hiểu bạn hơn"
        title="Cùng lên lộ trình học phù hợp"
        description="Vài câu hỏi ngắn để gợi ý cấp độ nên bắt đầu và nhịp học phù hợp mục tiêu của bạn."
      />

      {errorBanner && <ErrorNote>{errorBanner}</ErrorNote>}
      {error && <ErrorNote>{error}</ErrorNote>}

      {step === 1 && placementOpen && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Icon name="spark" size={15} /> Test xếp cấp nhanh
              </p>
              <h2 className="mt-1 font-semibold">
                Trả lời nhanh {placementQuestions.length || 6} từ từ dễ đến nâng cao
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                if (placementTimer.current) clearTimeout(placementTimer.current);
                setPlacementOpen(false);
              }}
              className="min-h-9! px-3! py-1.5! text-xs!"
            >
              Tự chọn
            </Button>
          </div>

          {pLoading ? (
            <Spinner />
          ) : pError ? (
            <div className="space-y-3">
              <ErrorNote>{pError}</ErrorNote>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPlacementOpen(false)}>
                  Quay lại tự chọn
                </Button>
                <Button onClick={() => void startPlacementTest()}>Thử lại</Button>
              </div>
            </div>
          ) : activePlacementQ ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Câu <strong className="text-foreground">{pIdx + 1}</strong> /{" "}
                  {placementQuestions.length}
                </span>
                <span>Mức Level {activePlacementQ.level}</span>
              </div>
              <ProgressBar
                value={(pIdx / placementQuestions.length) * 100}
                label="Tiến độ bài test xếp cấp"
              />
              <div className="rounded-2xl bg-surface-2/65 px-4 py-6 text-center">
                <p className="text-xs text-muted">Nghĩa đúng của từ này là gì?</p>
                <p lang="en" className="word-display mt-2 text-3xl font-bold">
                  {activePlacementQ.prompt}
                </p>
                {activePlacementQ.pronunciation && (
                  <p className="mt-1.5 text-sm text-primary">
                    {activePlacementQ.pronunciation}
                  </p>
                )}
              </div>
              <div className="space-y-2.5" role="group" aria-label="Chọn đáp án">
                {activePlacementQ.options.map((opt, optionIndex) => {
                  const isPicked = pPicked === opt;
                  const isRight = opt === activePlacementQ.answer;
                  const revealed = pPicked !== null;
                  let cls =
                    "border-border bg-surface hover:border-primary/35 hover:bg-surface-2";
                  if (revealed) {
                    if (isRight) cls = "border-good bg-good/10 text-good";
                    else if (isPicked) cls = "border-danger bg-danger/10 text-danger";
                    else cls = "border-border bg-surface opacity-55";
                  }
                  return (
                    <button
                      key={`${optionIndex}-${opt}`}
                      type="button"
                      disabled={revealed}
                      onClick={() => pickPlacementOption(opt)}
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
            </div>
          ) : null}
        </Card>
      )}

      {step === 1 && !placementOpen && (
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Icon name="spark" size={14} /> Không chắc mình ở cấp nào?
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Làm bài test xếp cấp nhanh (6 câu · 30 giây) để Lingo tự gợi ý đúng cấp độ.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => void startPlacementTest()}
              className="min-h-9! shrink-0 px-3! py-1.5! text-xs!"
            >
              {placementSummary ? "Làm lại test nhanh" : "Test xếp cấp nhanh"}
            </Button>
          </div>

          {placementSummary && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-good/25 bg-good/10 px-3.5 py-2.5 text-xs font-medium text-good"
            >
              <Icon name="check" size={16} className="shrink-0" />
              <span>
                Đúng {placementSummary.correctCount}/{placementSummary.total} câu — Gợi ý phù hợp:{" "}
                <strong>{levelLabel(placementSummary.recommendedLevel)}</strong>
              </span>
            </div>
          )}

          <h2 className="font-semibold">Bạn đã học tiếng Anh trước đây chưa?</h2>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton
              active={hasStudiedBefore === true}
              onClick={() => setHasStudiedBefore(true)}
            >
              Rồi, có học qua
            </ChoiceButton>
            <ChoiceButton
              active={hasStudiedBefore === false}
              onClick={() => {
                setHasStudiedBefore(false);
                setSelfAssessedLevel(null);
              }}
            >
              Chưa, mới bắt đầu
            </ChoiceButton>
          </div>
          {hasStudiedBefore && (
            <div>
              <p className="mb-3 text-sm text-muted">
                Bạn tự đánh giá đã học tới khoảng cấp nào?
              </p>
              <LevelGrid value={selfAssessedLevel} onChange={setSelfAssessedLevel} />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              disabled={
                hasStudiedBefore === null ||
                (hasStudiedBefore && !selfAssessedLevel)
              }
              onClick={() => setStep(2)}
            >
              Tiếp tục <Icon name="arrow" size={16} />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-5">
          <h2 className="font-semibold">Mục tiêu chính của bạn là gì?</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GOALS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGoal(g.key)}
                aria-pressed={goal === g.key}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-xs font-medium transition-colors ${
                  goal === g.key
                    ? "border-primary/40 bg-primary/8 text-primary"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                <Icon name={g.icon} size={20} />
                {g.label}
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <Icon name="back" size={16} /> Quay lại
            </Button>
            <Button disabled={!goal} onClick={() => setStep(3)}>
              Tiếp tục <Icon name="arrow" size={16} />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-5">
          <h2 className="font-semibold">Bạn có muốn đạt một cấp độ cụ thể không?</h2>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton
              active={plansToTakeExam === true}
              onClick={() => setPlansToTakeExam(true)}
            >
              Có, tôi có mục tiêu
            </ChoiceButton>
            <ChoiceButton
              active={plansToTakeExam === false}
              onClick={() => {
                setPlansToTakeExam(false);
                setTargetLevel(null);
                setTargetDate("");
              }}
            >
              Chưa, học từ từ thôi
            </ChoiceButton>
          </div>
          {plansToTakeExam && (
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm text-muted">Bạn muốn đạt tới cấp nào?</p>
                <LevelGrid value={targetLevel} onChange={setTargetLevel} />
              </div>
              <div>
                <label
                  htmlFor="onboarding-target-date"
                  className="mb-2 block text-sm text-muted"
                >
                  Hạn muốn đạt (không bắt buộc)
                </label>
                <input
                  id="onboarding-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="field max-w-xs"
                />
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep(2)}>
              <Icon name="back" size={16} /> Quay lại
            </Button>
            <Button
              disabled={
                plansToTakeExam === null ||
                (plansToTakeExam && !targetLevel) ||
                busy
              }
              onClick={() => void submit()}
            >
              {busy
                ? "Đang lưu…"
                : authenticated
                  ? "Xem lộ trình đề xuất"
                  : "Tạo tài khoản để xem lộ trình"}
              <Icon name={authenticated ? "check" : "arrow"} size={16} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-14 rounded-xl border px-4 text-sm font-semibold transition-colors ${
        active
          ? "border-primary/40 bg-primary/8 text-primary"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function LevelGrid({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (level: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {LEVELS.map((lv) => (
        <button
          key={lv}
          type="button"
          onClick={() => onChange(lv)}
          aria-pressed={value === lv}
          className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors ${
            value === lv
              ? "bg-primary text-primary-fg"
              : "bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          Level {lv}
          <span className="text-[11px] font-normal opacity-80">
            {levelName(lv)}
          </span>
        </button>
      ))}
    </div>
  );
}

function ResultScreen({
  profile,
  onRedo,
}: {
  profile: OnboardingProfile;
  onRedo: () => void;
}) {
  const router = useRouter();
  return (
    <div className="page-wrap max-w-2xl space-y-6">
      <PageHeading
        icon="route"
        eyebrow="Lộ trình đề xuất cho bạn"
        title={`Bắt đầu từ ${levelLabel(profile.recommendedLevel)}`}
        description="Dựa trên câu trả lời của bạn — có thể làm lại khảo sát bất cứ lúc nào."
      />
      <Card className="space-y-5">
        <p className="whitespace-pre-line text-sm leading-6">
          {profile.recommendationVi}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              router.push(`/learn?level=${profile.recommendedLevel}`)
            }
          >
            Bắt đầu học Level {profile.recommendedLevel}
            <Icon name="arrow" size={16} />
          </Button>
          <Link
            href="/dashboard"
            className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
          >
            Vào trang chủ
          </Link>
          <Button variant="ghost" onClick={onRedo}>
            Làm lại khảo sát
          </Button>
        </div>
      </Card>
    </div>
  );
}
