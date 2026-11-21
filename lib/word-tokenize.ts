export interface SentenceToken {
  text: string;
  /** Lowercased lookup word if this token is a clickable English word, otherwise null. */
  word: string | null;
}

const WORD_PART = /([A-Za-z]+(?:'[A-Za-z]+)?)/g;

/**
 * Splits an English sentence into alternating text and clickable word tokens
 * while preserving the exact original characters when concatenated.
 */
export function tokenizeSentence(sentence: string): SentenceToken[] {
  if (!sentence) return [];
  const tokens: SentenceToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  WORD_PART.lastIndex = 0;

  while ((match = WORD_PART.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        text: sentence.slice(lastIndex, match.index),
        word: null,
      });
    }
    const raw = match[0];
    const clean = raw.replace(/'s$/i, "").replace(/[^A-Za-z]/g, "").toLowerCase();
    tokens.push({
      text: raw,
      word: clean.length >= 2 ? clean : null,
    });
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < sentence.length) {
    tokens.push({
      text: sentence.slice(lastIndex),
      word: null,
    });
  }

  return tokens;
}
