"use client";

import useSWR from "swr";
import { api, apiFetch, API_BASE } from "./api";
import type {
  Achievement,
  AdminGrammarInput,
  AdminGrammarPoint,
  AdminVideo,
  AdminWord,
  AdminWordFilter,
  AdminWordStats,
  AssistantAction,
  AssistantMessage,
  AssistantSession,
  DayActivity,
  ExamHistory,
  Leaderboard,
  LeaderboardMetric,
  LeaderboardMetricKey,
  GrammarDetail,
  GrammarLevel,
  GrammarListItem,
  EnglishLevel,
  LearnPath,
  LessonDetail,
  NotebookTab,
  NotebookWord,
  OnboardingProfile,
  Paginated,
  PracticeSkill,
  PracticeStats,
  ProgressOverview,
  PublicProfile,
  QuizAttemptSummary,
  StreakInfo,
  ReferralStats,
  StudyStats,
  SubmitOnboardingInput,
  UserSearchResult,
  VideoCard,
  VideoComment,
  VideoDetail,
  Word,
  WordReportReason,
} from "./types";

const fetcher = <T>(path: string) => apiFetch<T>(path);

export function useLevels() {
  return useSWR<EnglishLevel[]>("/levels", fetcher);
}

export function useProgress() {
  return useSWR<ProgressOverview>("/progress/overview", fetcher);
}

export function useStreak() {
  return useSWR<StreakInfo>("/streak", fetcher);
}

export function useStreakHistory(days = 30) {
  return useSWR<DayActivity[]>(`/streak/history?days=${days}`, fetcher);
}

export function useStudyStats() {
  return useSWR<StudyStats>("/study/stats", fetcher, {
    refreshInterval: 60_000,
  });
}

export function useAchievements() {
  return useSWR<Achievement[]>("/achievements", fetcher);
}

export function useRecentQuizzes() {
  return useSWR<QuizAttemptSummary[]>("/quiz/recent", fetcher);
}

export function useLearnPath(level?: number) {
  return useSWR<LearnPath>(
    level ? `/learn/path?level=${level}` : "/learn/path",
    fetcher,
    { keepPreviousData: true },
  );
}

export function useLesson(id: string | null) {
  return useSWR<LessonDetail>(id ? `/learn/lessons/${id}` : null, fetcher);
}

export function useWords(params: {
  level?: number;
  q?: string;
  page?: number;
  /** Only words that have an example sentence, returned with them. */
  withExamples?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params.level) qs.set("level", String(params.level));
  if (params.q) qs.set("q", params.q);
  if (params.withExamples) qs.set("withExamples", "true");
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", "24");
  return useSWR<Paginated<Word>>(`/words?${qs.toString()}`, fetcher);
}

const NOTEBOOK_PAGE_SIZE = 24;
const SAVED_IDS_KEY = "/notebook/ids";

export function useNotebook(tab: NotebookTab, page: number) {
  return useSWR<Paginated<NotebookWord>>(
    `/notebook?tab=${tab}&page=${page}&pageSize=${NOTEBOOK_PAGE_SIZE}`,
    fetcher,
    { keepPreviousData: true },
  );
}

/** Ids of the user's saved words, shared by every save button on the page. */
export function useSavedWordIds() {
  return useSWR<string[]>(SAVED_IDS_KEY, fetcher);
}

export function setWordSaved(wordId: string, saved: boolean) {
  return saved
    ? api.post<{ saved: boolean }>(`/notebook/${wordId}`)
    : api.del<{ saved: boolean }>(`/notebook/${wordId}`);
}

/** Flags AI-generated content of a word as wrong for an admin to check. */
export function reportWord(
  wordId: string,
  reason: WordReportReason,
  note?: string,
) {
  return api.post<{ reported: boolean }>(`/words/${wordId}/reports`, {
    reason,
    note: note?.trim() || undefined,
  });
}

const ADMIN_PAGE_SIZE = 20;
const ADMIN_WORD_STATS_KEY = "/admin/words/stats";

const ADMIN_WORD_FILTER_PARAMS: Record<AdminWordFilter, [string, string] | null> =
  {
    all: null,
    unreviewed: ["reviewed", "false"],
    reviewed: ["reviewed", "true"],
    reported: ["reported", "true"],
    aiFlagged: ["aiFlagged", "true"],
  };

export function useAdminWords(params: {
  q: string;
  level?: number;
  page: number;
  filter: AdminWordFilter;
}) {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(ADMIN_PAGE_SIZE),
  });
  if (params.q) qs.set("q", params.q);
  if (params.level) qs.set("level", String(params.level));
  const filter = ADMIN_WORD_FILTER_PARAMS[params.filter];
  if (filter) qs.set(...filter);
  return useSWR<Paginated<AdminWord>>(`/admin/words?${qs}`, fetcher, {
    keepPreviousData: true,
  });
}

export function useAdminWordStats() {
  return useSWR<AdminWordStats>(ADMIN_WORD_STATS_KEY, fetcher);
}

/** Any content edit also approves the word; `reviewed` alone approves it as
 * is (true) or undoes an approval (false). */
export function updateAdminWord(
  id: string,
  body: Partial<
    Pick<Word, "word" | "pronunciation" | "meaningVi" | "meaningEn">
  > & { example?: { en: string; vi?: string }; reviewed?: boolean },
) {
  return api.patch<AdminWord>(`/admin/words/${id}`, body);
}

/** Approves several words as they are (closes their reports and AI doubts). */
export function reviewAdminWords(ids: string[]) {
  return api.post<{ reviewed: number }>("/admin/words/review", { ids });
}

export function useAdminGrammar(level?: number) {
  return useSWR<AdminGrammarPoint[]>(
    `/admin/grammar${level ? `?level=${level}` : ""}`,
    fetcher,
  );
}

export function createAdminGrammar(body: AdminGrammarInput) {
  return api.post<AdminGrammarPoint>("/admin/grammar", body);
}

/** The slug cannot be changed after creation. */
export function updateAdminGrammar(
  id: string,
  body: Partial<Omit<AdminGrammarInput, "slug">>,
) {
  return api.patch<AdminGrammarPoint>(`/admin/grammar/${id}`, body);
}

export function deleteAdminGrammar(id: string) {
  return api.del<{ deleted: boolean }>(`/admin/grammar/${id}`);
}

export function useAdminVideos(params: { q: string; page: number }) {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(ADMIN_PAGE_SIZE),
  });
  if (params.q) qs.set("q", params.q);
  return useSWR<Paginated<AdminVideo>>(`/admin/videos?${qs}`, fetcher, {
    keepPreviousData: true,
  });
}

export function updateAdminVideo(
  id: string,
  body: Partial<Pick<AdminVideo, "title" | "titleEn" | "level" | "kind">>,
) {
  return api.patch<AdminVideo>(`/admin/videos/${id}`, body);
}

/** Owners and admins may delete a video (checked by the server). */
export function deleteVideo(id: string) {
  return api.del(`/videos/${id}`);
}

export function useVideos(params: { level?: number; kind?: string; mine?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.level) qs.set("level", String(params.level));
  if (params.kind) qs.set("kind", params.kind);
  if (params.mine) qs.set("mine", "true");
  const q = qs.toString();
  return useSWR<VideoCard[]>(`/videos${q ? `?${q}` : ""}`, fetcher, {
    keepPreviousData: true,
  });
}

export function useVideo(id: string | null) {
  return useSWR<VideoDetail>(id ? `/videos/${id}` : null, fetcher);
}

export function useComments(videoId: string | null, page = 1) {
  return useSWR<Paginated<VideoComment>>(
    videoId ? `/videos/${videoId}/comments?page=${page}&pageSize=20` : null,
    fetcher,
  );
}

export function postComment(
  videoId: string,
  content: string,
  parentId?: string,
) {
  return api.post<VideoComment>(`/videos/${videoId}/comments`, {
    content,
    parentId,
  });
}

export function deleteComment(videoId: string, commentId: string) {
  return api.del(`/videos/${videoId}/comments/${commentId}`);
}

export function likeVideo(videoId: string) {
  return api.post<{ liked: boolean; likeCount: number }>(
    `/videos/${videoId}/like`,
  );
}

export function unlikeVideo(videoId: string) {
  return api.del<{ liked: boolean; likeCount: number }>(
    `/videos/${videoId}/like`,
  );
}

export function followUser(userId: string) {
  return api.post<{ following: boolean; followerCount: number }>(
    `/users/${userId}/follow`,
  );
}

export function unfollowUser(userId: string) {
  return api.del<{ following: boolean; followerCount: number }>(
    `/users/${userId}/follow`,
  );
}

export function usePublicProfile(userId: string | null) {
  return useSWR<PublicProfile>(
    userId ? `/users/${userId}/profile` : null,
    fetcher,
  );
}

export function useReferralStats() {
  return useSWR<ReferralStats>("/referrals/me", fetcher);
}

/** Tìm người dùng theo tên — để theo dõi/nhắn tin khi họ không lọt bảng xếp hạng. */
export function useUserSearch(q: string) {
  const query = q.trim();
  return useSWR<UserSearchResult[]>(
    query ? `/users/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
  );
}

export function useGrammarLevels() {
  return useSWR<GrammarLevel[]>("/grammar/levels", fetcher);
}

export function useGrammar(level?: number) {
  return useSWR<GrammarListItem[]>(
    `/grammar${level ? `?level=${level}` : ""}`,
    fetcher,
  );
}

export function useGrammarPoint(slug: string | null) {
  return useSWR<GrammarDetail>(slug ? `/grammar/${slug}` : null, fetcher);
}

export function useExamHistory() {
  return useSWR<ExamHistory>("/exams/attempts", fetcher);
}

export function useLeaderboardMetrics() {
  return useSWR<LeaderboardMetric[]>("/leaderboard/metrics", fetcher);
}

export function useLeaderboard(
  metric: LeaderboardMetricKey,
  scope: "global" | "friends" = "global",
) {
  return useSWR<Leaderboard>(
    `/leaderboard?metric=${metric}&scope=${scope}`,
    fetcher,
  );
}

export function usePracticeStats(skill: PracticeSkill) {
  return useSWR<PracticeStats>(`/practice/stats?skill=${skill}`, fetcher);
}

/** Ghi 1 lượt luyện nghe/phát âm lên server — không chặn UI nếu lỗi mạng. */
export function recordPracticeAttempt(
  wordId: string,
  skill: PracticeSkill,
  durationMs: number,
  isCorrect?: boolean,
) {
  return api
    .post("/practice/attempts", {
      wordId,
      skill,
      durationMs: Math.round(durationMs),
      isCorrect,
    })
    .catch(() => undefined);
}

/** null = chưa làm khảo sát bao giờ. `enabled=false` khi chưa đăng nhập (tránh gọi API cần auth). */
export function useOnboarding(enabled = true) {
  return useSWR<OnboardingProfile | null>(enabled ? "/onboarding" : null, fetcher);
}

export function submitOnboarding(input: SubmitOnboardingInput) {
  return api.post<OnboardingProfile>("/onboarding", input);
}

/** Chỉ tải khi widget đang mở — tránh gọi API này trên mọi trang cho mọi user. */
export function useAssistantSessions(enabled: boolean) {
  return useSWR<AssistantSession[]>(
    enabled ? "/assistant/sessions" : null,
    fetcher,
  );
}

export function useAssistantMessages(sessionId: string | null) {
  return useSWR<AssistantMessage[]>(
    sessionId ? `/assistant/sessions/${sessionId}/messages` : null,
    fetcher,
  );
}

export function createAssistantSession() {
  return api.post<AssistantSession>("/assistant/sessions");
}

/**
 * Streaming qua SSE (`EventSource`) — trả từng đoạn chữ ngay khi có thay vì
 * đợi cả câu trả lời xong. Trả về hàm để đóng kết nối sớm (vd widget đóng
 * giữa chừng). `EventSource` không tự refresh token 401 như `apiFetch` —
 * chấp nhận được vì access token sống đủ lâu (mặc định 15 phút) so với 1
 * lượt hỏi, không đáng để xử lý riêng.
 */
export function streamAssistant(
  message: string,
  sessionId: string | undefined,
  handlers: {
    onDelta: (delta: string) => void;
    onDone: (sessionId: string, action?: AssistantAction) => void;
    onError: () => void;
  },
): () => void {
  const params = new URLSearchParams({ message });
  if (sessionId) params.set("sessionId", sessionId);
  const es = new EventSource(`${API_BASE}/assistant/ask/stream?${params}`, {
    withCredentials: true,
  });
  es.onmessage = (event) => {
    let payload: {
      delta?: string;
      done?: boolean;
      sessionId?: string;
      action?: AssistantAction;
    };
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }
    if (payload.delta) handlers.onDelta(payload.delta);
    if (payload.done) {
      handlers.onDone(payload.sessionId ?? sessionId ?? "", payload.action);
      es.close();
    }
  };
  es.onerror = () => {
    handlers.onError();
    es.close();
  };
  return () => es.close();
}

export function deleteAssistantSession(sessionId: string) {
  return api.del<{ ok: true }>(`/assistant/sessions/${sessionId}`);
}
