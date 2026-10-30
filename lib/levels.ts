/** Lingo's 6 English levels. Level 1 is the easiest. Mirrors the server's
 * `src/common/levels.ts`. Kept dependency-free so `node --test` can import it. */
export const LEVEL_COUNT = 6;

export const LEVELS: readonly number[] = Array.from(
  { length: LEVEL_COUNT },
  (_, i) => i + 1,
);

export const LEVEL_NAMES: Readonly<Record<number, string>> = {
  1: "Beginner",
  2: "Elementary",
  3: "Pre-Intermediate",
  4: "Intermediate",
  5: "Upper-Intermediate",
  6: "Advanced",
};

export type LevelBand = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export const BAND_VI: Readonly<Record<LevelBand, string>> = {
  BEGINNER: "Sơ cấp",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Cao cấp",
};

const BAND_TONE: Readonly<Record<LevelBand, string>> = {
  BEGINNER: "bg-good/10 text-good",
  INTERMEDIATE: "bg-warn/10 text-warn",
  ADVANCED: "bg-lavender/10 text-lavender",
};

export function isValidLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= LEVEL_COUNT;
}

/** Falls back to "Level n" for values outside 1–6 instead of throwing:
 * data coming from the API should never crash the UI. */
export function levelName(level: number): string {
  return LEVEL_NAMES[level] ?? `Level ${level}`;
}

/** "Level 3 · Pre-Intermediate" */
export function levelLabel(level: number): string {
  const name = LEVEL_NAMES[level];
  return name ? `Level ${level} · ${name}` : `Level ${level}`;
}

/** Bands group levels in pairs: 1–2, 3–4, 5–6. */
export function levelBand(level: number): LevelBand {
  if (level <= 2) return "BEGINNER";
  if (level <= 4) return "INTERMEDIATE";
  return "ADVANCED";
}

/** Vietnamese band label plus the Tailwind classes used for its badge. */
export function levelBandStyle(level: number): { label: string; tone: string } {
  const band = levelBand(level);
  return { label: BAND_VI[band], tone: BAND_TONE[band] };
}
