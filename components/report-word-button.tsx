"use client";

import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { reportWord } from "@/lib/hooks";
import type { WordReportReason } from "@/lib/types";
import { WORD_REPORT_REASONS } from "@/lib/word-report-reasons";
import { Button, ErrorNote } from "./ui";
import { Icon } from "./icon";

/** Must match `REPORT_NOTE_MAX_LENGTH` on the server. */
const NOTE_MAX_LENGTH = 500;

/** Flag button that lets a learner report wrong AI-generated content (meaning,
 * IPA, example) of a word. Admins review the reports in /admin. */
export function ReportWordButton({
  wordId,
  word,
  size = 18,
  className = "",
}: {
  wordId: string;
  /** Used in labels. */
  word: string;
  size?: number;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<WordReportReason>("MEANING");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function open(event: React.MouseEvent) {
    // The button sits inside clickable cards (flashcard, word tiles).
    event.stopPropagation();
    event.preventDefault();
    setError(null);
    dialog.current?.showModal();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await reportWord(wordId, reason, note);
      setSent(true);
      setNote("");
      dialog.current?.close();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Chưa gửi được, thử lại nhé.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Báo lỗi nội dung của "${word}"`}
        title={sent ? "Đã gửi báo lỗi — cảm ơn bạn!" : "Báo lỗi nội dung từ này"}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-2 ${sent ? "text-warn" : "text-muted hover:text-warn"} ${className}`}
      >
        <Icon name="flag" size={size} />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`report-${wordId}`}
        onClick={(event) => {
          event.stopPropagation();
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === dialog.current) dialog.current.close();
        }}
        className="m-auto w-[min(92vw,420px)] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/40"
      >
        <form onSubmit={(e) => void submit(e)} className="space-y-4 p-5">
          <div>
            <h2 id={`report-${wordId}`} className="font-semibold">
              Báo lỗi từ <span lang="en">“{word}”</span>
            </h2>
            <p className="mt-1 text-xs text-muted">
              Nghĩa, phiên âm và câu ví dụ do AI soạn nên có thể sai. Báo lỗi
              giúp quản trị viên sửa nhanh hơn.
            </p>
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">Lỗi ở đâu?</legend>
            {WORD_REPORT_REASONS.map((r) => (
              <label
                key={r.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={`reason-${wordId}`}
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                {r.label}
              </label>
            ))}
          </fieldset>
          <label className="block text-sm font-medium">
            Ghi chú (tuỳ chọn)
            <textarea
              rows={3}
              maxLength={NOTE_MAX_LENGTH}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: nghĩa đúng phải là…"
              className="field mt-1.5"
            />
          </label>
          {error && <ErrorNote>{error}</ErrorNote>}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => dialog.current?.close()}
              disabled={busy}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={busy}>
              <Icon name="flag" size={16} />
              {busy ? "Đang gửi…" : "Gửi báo lỗi"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
