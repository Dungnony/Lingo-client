"use client";

import useSWR from "swr";
import { api, apiFetch } from "./api";
import type {
  GameMode,
  MinigameLeaderboardRow,
  MinigameResult,
  MinigameStartResponse,
} from "./types";

const fetcher = <T>(path: string) => apiFetch<T>(path);

export function startMinigame(mode: GameMode = "TRANSLATE") {
  return api.post<MinigameStartResponse>("/minigame/start", { mode });
}

export function finishMinigame(
  sessionId: string,
  answers: { wordId: string; chosenIndex: number }[],
) {
  return api.post<MinigameResult>(`/minigame/${sessionId}/finish`, {
    answers,
  });
}

/** MATCH ("Ghép cặp") — không có `answers` trắc nghiệm, chỉ báo số lần lật
 * sai; thời gian do server tự đo, xem `gradeMatch()` ở server. */
export function finishMatchMinigame(sessionId: string, mistakes: number) {
  return api.post<MinigameResult>(`/minigame/${sessionId}/finish`, {
    mistakes,
  });
}

export function useMinigameLeaderboard(
  period: "daily" | "weekly" = "daily",
  mode: GameMode = "TRANSLATE",
) {
  return useSWR<MinigameLeaderboardRow[]>(
    `/minigame/leaderboard?period=${period}&mode=${mode}`,
    fetcher,
  );
}
