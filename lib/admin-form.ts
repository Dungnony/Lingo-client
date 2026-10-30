// Pure helpers for the admin forms. Kept free of React and "@/" imports so
// `node --test` can load this file directly.

export interface ExamplePair {
  en: string;
  vi: string;
}

/** Same separator as hand-written video transcripts. */
const EXAMPLE_SEPARATOR = "|";

export function linesToList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/** Parses one "English | Vietnamese" example per line. Lines without an
 * English part are reported by their 1-based line number. */
export function parseExampleLines(text: string): {
  examples: ExamplePair[];
  invalidLines: number[];
} {
  const examples: ExamplePair[] = [];
  const invalidLines: number[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (line.trim() === "") return;
    const at = line.indexOf(EXAMPLE_SEPARATOR);
    const en = (at === -1 ? line : line.slice(0, at)).trim();
    const vi = at === -1 ? "" : line.slice(at + 1).trim();
    if (en === "") invalidLines.push(index + 1);
    else examples.push({ en, vi });
  });
  return { examples, invalidLines };
}

export function formatExampleLines(examples: readonly ExamplePair[]): string {
  return examples
    .map(({ en, vi }) => (vi ? `${en} ${EXAMPLE_SEPARATOR} ${vi}` : en))
    .join("\n");
}
