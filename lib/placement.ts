export interface PlacementAnswerResult {
  level: number;
  isCorrect: boolean;
}

export function computePlacementLevel(
  results: readonly PlacementAnswerResult[],
): { recommendedLevel: number; correctCount: number; total: number } {
  let placed = 1;
  for (let lv = 1; lv <= 6; lv += 1) {
    const hits = results.filter((r) => r.level <= lv && r.isCorrect).length;
    const hitAtLv = results.some((r) => r.level === lv && r.isCorrect);
    if (hits >= Math.max(1, lv - 1) && hitAtLv) {
      placed = lv;
    }
  }
  const correctCount = results.filter((r) => r.isCorrect).length;
  return {
    recommendedLevel: placed,
    correctCount,
    total: results.length,
  };
}
