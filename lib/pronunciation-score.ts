/** Dependency-free so `node --test` can import it. */

/** Minimum score counted as a correct pronunciation. */
export const PASS_SCORE = 80;

export interface PronunciationScore {
  /** 0–100 */
  score: number;
  /** The recognised text closest to the target. */
  heard: string;
  passed: boolean;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 0 : 1 - levenshtein(a, b) / longest;
}

/**
 * Compares what the speech recogniser heard with the target word. The
 * recogniser returns several guesses; the closest one counts, so a word it
 * heard correctly as its 2nd guess still passes. Case and punctuation are
 * ignored ("Hello." matches "hello").
 */
export function scorePronunciation(
  target: string,
  heardAlternatives: readonly string[],
): PronunciationScore {
  const goal = normalize(target);
  let best: PronunciationScore = { score: 0, heard: "", passed: false };
  for (const raw of heardAlternatives) {
    const heard = normalize(raw);
    if (!heard) continue;
    const score = Math.round(similarity(goal, heard) * 100);
    if (score > best.score) {
      best = { score, heard: raw.trim(), passed: score >= PASS_SCORE };
    }
  }
  return best;
}
