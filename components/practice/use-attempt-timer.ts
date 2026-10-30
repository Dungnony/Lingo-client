"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Time spent on the current practice item, for a minutes daily goal. Each call
 * returns the time since the item was shown or since the previous call,
 * whichever is later, so several attempts on one word never count the same
 * seconds twice. The server caps what one attempt can add.
 */
export function useAttemptTimer(itemKey: string): () => number {
  const since = useRef(0);

  useEffect(() => {
    since.current = Date.now();
  }, [itemKey]);

  return useCallback(() => {
    const now = Date.now();
    const elapsed = since.current ? now - since.current : 0;
    since.current = now;
    return elapsed;
  }, []);
}
