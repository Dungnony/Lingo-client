"use client";

import Link from "next/link";
import { useEffect } from "react";
import useSWR from "swr";
import { AudioButton } from "@/components/audio-button";
import { Icon } from "@/components/icon";
import { SaveWordButton } from "@/components/save-word-button";
import { Spinner } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { levelBandStyle, levelLabel } from "@/lib/levels";
import type { Paginated, Word } from "@/lib/types";
import { tokenizeSentence } from "@/lib/word-tokenize";

async function fetchWordLookup(rawWord: string): Promise<Word | null> {
  try {
    const res = await apiFetch<{ word: Word | null }>(
      `/words/lookup?w=${encodeURIComponent(rawWord)}`,
    );
    if (res?.word) return res.word;
  } catch {
    // Fall back to the general search endpoint if /words/lookup is unavailable.
  }
  const list = await apiFetch<Paginated<Word>>(
    `/words?q=${encodeURIComponent(rawWord)}&withExamples=true&page=1&pageSize=10`,
  );
  const lower = rawWord.toLowerCase();
  return (
    list.items.find((item) => item.word.toLowerCase() === lower) ??
    list.items[0] ??
    null
  );
}

/**
 * Renders an English sentence where each word can be clicked/tapped to open
 * the quick dictionary lookup popover without triggering parent row clicks.
 */
export function InteractiveEnglishText({
  text,
  selectedWord,
  onWordClick,
}: {
  text: string;
  selectedWord?: string | null;
  onWordClick: (word: string) => void;
}) {
  const tokens = tokenizeSentence(text);
  return (
    <>
      {tokens.map((token, idx) => {
        if (!token.word) return <span key={idx}>{token.text}</span>;
        const word = token.word;
        const isSelected = selectedWord?.toLowerCase() === word;
        return (
          <span
            key={idx}
            role="button"
            tabIndex={0}
            title={`Tra nhanh từ "${token.text}"`}
            onClick={(event) => {
              event.stopPropagation();
              onWordClick(word);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onWordClick(word);
              }
            }}
            className={`cursor-pointer rounded px-0.5 transition-colors hover:bg-primary/12 hover:text-primary hover:underline decoration-primary/40 underline-offset-4 ${
              isSelected ? "bg-primary/15 text-primary underline" : ""
            }`}
          >
            {token.text}
          </span>
        );
      })}
    </>
  );
}

export function WordLookupPopover({
  word,
  onClose,
}: {
  word: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useSWR(
    word ? ["word-lookup", word] : null,
    ([, w]) => fetchWordLookup(w),
  );

  useEffect(() => {
    if (!word) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [word, onClose]);

  if (!word) return null;

  const example = data?.examples?.[0];

  return (
    <div
      role="dialog"
      aria-label={`Tra nhanh từ ${word}`}
      className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <AudioButton
            src={data?.audioUrl}
            text={data?.word ?? word}
            size={34}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p lang="en" className="word-display text-xl font-bold">
                {data?.word ?? word}
              </p>
              {data?.pos && (
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">
                  {data.pos}
                </span>
              )}
              {data?.level && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    levelBandStyle(data.level).tone
                  }`}
                >
                  {levelLabel(data.level)}
                </span>
              )}
            </div>
            {data?.pronunciation && (
              <p className="text-xs text-primary">{data.pronunciation}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {data && <SaveWordButton wordId={data.id} word={data.word} />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng khung tra từ"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 border-t border-border pt-3 text-sm">
        {isLoading ? (
          <div className="py-3">
            <Spinner />
          </div>
        ) : data ? (
          <div className="space-y-2">
            <p className="font-semibold text-foreground">
              {data.meaningVi ?? "Chưa có nghĩa tiếng Việt"}
            </p>
            {data.meaningEn && (
              <p lang="en" className="text-xs leading-5 text-muted">
                {data.meaningEn}
              </p>
            )}
            {example && (
              <div className="rounded-xl bg-surface-2 px-3 py-2 text-xs">
                <p lang="en" className="font-medium text-foreground">
                  {example.en}
                </p>
                {example.vi && (
                  <p className="mt-0.5 text-muted">{example.vi}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs leading-5 text-muted">
            Từ <strong lang="en">&ldquo;{word}&rdquo;</strong> chưa nằm trong
            kho từ vựng cốt lõi — bạn vẫn có thể bấm nút loa ở trên để nghe phát
            âm tiếng Anh.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs">
        <span className="text-muted">Bấm vào từ bất kỳ trong câu để tra</span>
        <Link
          href={`/vocabulary?q=${encodeURIComponent(data?.word ?? word)}`}
          className="font-semibold text-primary hover:underline"
        >
          Mở kho từ vựng →
        </Link>
      </div>
    </div>
  );
}
