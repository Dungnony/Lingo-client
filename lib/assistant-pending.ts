// Pure helper for the assistant widget. Kept free of React and "@/" imports
// so `node --test` can load this file directly.

interface HasText {
  text: string;
}

/**
 * Optimistic chat messages still worth showing. They are dropped as soon as
 * the server history contains the last one, so the conversation never shows
 * the same turn twice.
 */
export function unsyncedPending<T extends HasText>(
  pending: readonly T[],
  synced: readonly HasText[] | undefined,
): T[] {
  const last = pending[pending.length - 1];
  if (!last || !synced) return [...pending];
  return synced.some((m) => m.text === last.text) ? [] : [...pending];
}
