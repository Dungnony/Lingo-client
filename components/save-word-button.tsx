"use client";

import { useState } from "react";
import { setWordSaved, useSavedWordIds } from "@/lib/hooks";
import { Icon } from "./icon";

/** Heart toggle that adds/removes a word from the user's notebook. Updates
 * optimistically and rolls back if the request fails. */
export function SaveWordButton({
  wordId,
  word,
  size = 18,
  className = "",
  onChange,
}: {
  wordId: string;
  /** Used in the accessible label. */
  word: string;
  size?: number;
  className?: string;
  onChange?: (saved: boolean) => void;
}) {
  const { data: ids, mutate } = useSavedWordIds();
  const [failed, setFailed] = useState(false);
  const saved = ids?.includes(wordId) ?? false;

  async function toggle(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    const next = !saved;
    setFailed(false);
    await mutate(
      (current = []) =>
        next ? [...current, wordId] : current.filter((id) => id !== wordId),
      { revalidate: false },
    );
    try {
      await setWordSaved(wordId, next);
      onChange?.(next);
    } catch {
      setFailed(true);
      await mutate();
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => void toggle(event)}
      aria-pressed={saved}
      aria-label={saved ? `Bỏ "${word}" khỏi sổ tay` : `Lưu "${word}" vào sổ tay`}
      title={
        failed
          ? "Chưa lưu được, thử lại nhé"
          : saved
            ? "Đã lưu vào sổ tay"
            : "Lưu vào sổ tay"
      }
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-2 ${saved ? "text-danger" : failed ? "text-warn" : "text-muted hover:text-danger"} ${className}`}
    >
      <Icon name="heart" size={size} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
