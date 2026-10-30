/** Dependency-free so `node --test` can import it. */

export interface GradedWord {
  /** The word as written in the expected sentence (punctuation kept). */
  text: string;
  correct: boolean;
}

export interface DictationResult {
  words: GradedWord[];
  correctCount: number;
  /** Typed words that do not belong to the sentence. */
  extraCount: number;
  isPerfect: boolean;
}

/** Lowercases and drops punctuation, keeping apostrophes inside words
 * ("don't") and treating curly quotes like straight ones. */
function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, "")
    .replace(/^'+|'+$/g, "");
}

function tokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Compares a typed sentence with the expected one, ignoring case and
 * punctuation. Words are aligned with a longest-common-subsequence so one
 * missing or extra word does not mark every following word wrong.
 */
export function gradeDictation(expected: string, typed: string): DictationResult {
  const expTokens = tokens(expected);
  const exp = expTokens.map(normalizeToken);
  const got = tokens(typed).map(normalizeToken).filter(Boolean);

  // lcs[i][j] = LCS length of exp[i..] and got[j..]
  const lcs = Array.from({ length: exp.length + 1 }, () =>
    new Array<number>(got.length + 1).fill(0),
  );
  for (let i = exp.length - 1; i >= 0; i -= 1) {
    for (let j = got.length - 1; j >= 0; j -= 1) {
      lcs[i][j] =
        exp[i] !== "" && exp[i] === got[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const matched = new Array<boolean>(exp.length).fill(false);
  for (let i = 0, j = 0; i < exp.length && j < got.length; ) {
    if (exp[i] !== "" && exp[i] === got[j]) {
      matched[i] = true;
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }

  // A token that is only punctuation (e.g. "—") cannot be typed wrong.
  const words = expTokens.map((text, i) => ({
    text,
    correct: matched[i] || exp[i] === "",
  }));
  const matchedCount = matched.filter(Boolean).length;
  const correctCount = words.filter((w) => w.correct).length;
  const extraCount = got.length - matchedCount;
  return {
    words,
    correctCount,
    extraCount,
    isPerfect: correctCount === words.length && extraCount === 0,
  };
}
