export interface GrammarClozeInput {
  en: string;
  vi: string;
}

export interface GrammarClozeQuestion {
  index: number;
  before: string;
  after: string;
  answer: string;
  options: string[];
  vi: string;
  fullEn: string;
}

const GRAMMAR_KEYWORDS = new Set([
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "shall",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  "going",
  "used",
  "since",
  "for",
  "already",
  "yet",
  "ever",
  "never",
  "just",
  "while",
  "when",
  "if",
  "unless",
  "although",
  "though",
  "despite",
  "because",
  "so",
  "than",
  "more",
  "most",
  "as",
  "who",
  "whom",
  "whose",
  "which",
  "that",
  "where",
  "by",
  "to",
  "in",
  "on",
  "at",
  "with",
  "from",
]);

const FALLBACK_DISTRACTORS = [
  "have",
  "has",
  "had",
  "will",
  "would",
  "should",
  "could",
  "were",
  "was",
  "are",
  "been",
  "being",
  "does",
  "did",
  "since",
  "while",
  "unless",
  "which",
];

interface WordMatch {
  word: string;
  start: number;
  end: number;
}

function extractWords(sentence: string): WordMatch[] {
  const matches: WordMatch[] = [];
  const regex = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sentence)) !== null) {
    matches.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return matches;
}

function chooseTargetWord(words: WordMatch[]): WordMatch | null {
  const candidates = words.filter((w) => w.word.length >= 2);
  if (candidates.length === 0) return null;

  // Prefer grammar auxiliary/connector words first (skipping the first word if possible so capitalization isn't a giveaway).
  const internalKeyword = candidates
    .slice(1)
    .find((w) => GRAMMAR_KEYWORDS.has(w.word.toLowerCase()));
  if (internalKeyword) return internalKeyword;

  const anyKeyword = candidates.find((w) =>
    GRAMMAR_KEYWORDS.has(w.word.toLowerCase()),
  );
  if (anyKeyword) return anyKeyword;

  // Otherwise pick the longest content word (preferring non-initial words).
  const nonInitial = candidates.slice(1).filter((w) => w.word.length >= 3);
  const pool = nonInitial.length > 0 ? nonInitial : candidates;
  return pool.reduce((best, cur) =>
    cur.word.length > best.word.length ? cur : best,
  );
}

/** Deterministic rotation so options don't always have the answer in slot 0. */
function rotateOptions(options: string[], seed: number): string[] {
  if (options.length <= 1) return options;
  const offset = seed % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

export function buildGrammarClozeQuestions(
  examples: GrammarClozeInput[],
  maxQuestions = 4,
): GrammarClozeQuestion[] {
  const validExamples = examples.filter(
    (e) => typeof e.en === "string" && e.en.trim().length > 0,
  );
  if (validExamples.length === 0) return [];

  const allWords = validExamples.flatMap((e) =>
    extractWords(e.en)
      .map((w) => w.word.toLowerCase())
      .filter((w) => w.length >= 2),
  );

  const questions: GrammarClozeQuestion[] = [];
  for (const example of validExamples) {
    if (questions.length >= maxQuestions) break;
    const words = extractWords(example.en);
    if (words.length < 3) continue;
    const target = chooseTargetWord(words);
    if (!target) continue;

    const answer = target.word;
    const answerLower = answer.toLowerCase();
    const isCapitalized =
      answer[0] === answer[0].toUpperCase() &&
      answer[0] !== answer[0].toLowerCase();

    const distractorSet = new Set<string>();
    for (const candidate of [...allWords, ...FALLBACK_DISTRACTORS]) {
      if (distractorSet.size >= 3) break;
      if (candidate.toLowerCase() === answerLower) continue;
      const formatted = isCapitalized
        ? candidate[0].toUpperCase() + candidate.slice(1)
        : candidate;
      distractorSet.add(formatted);
    }

    const rawOptions = [answer, ...distractorSet];
    const seed =
      example.en.length + questions.length * 7 + answer.charCodeAt(0);
    const options = rotateOptions(rawOptions, seed);

    questions.push({
      index: questions.length,
      before: example.en.slice(0, target.start),
      after: example.en.slice(target.end),
      answer,
      options,
      vi: example.vi,
      fullEn: example.en,
    });
  }

  return questions;
}
