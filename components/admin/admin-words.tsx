"use client";

import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  ProgressBar,
  Spinner,
} from "@/components/ui";
import { Icon } from "@/components/icon";
import {
  reviewAdminWords,
  updateAdminWord,
  useAdminWords,
  useAdminWordStats,
} from "@/lib/hooks";
import { levelLabel } from "@/lib/levels";
import type { AdminWord, AdminWordFilter } from "@/lib/types";
import { reportReasonLabel } from "@/lib/word-report-reasons";
import { errorMessage, Field, LevelSelect, Pager } from "./admin-shared";

const FILTERS: { value: AdminWordFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "unreviewed", label: "Chưa duyệt" },
  { value: "reviewed", label: "Đã duyệt" },
  { value: "reported", label: "Bị báo lỗi" },
  { value: "aiFlagged", label: "AI nghi ngờ" },
];

/** `fixedFilter` locks the list (the "Báo lỗi" tab always shows reported
 * words); otherwise the admin picks a filter. */
export function AdminWords({
  fixedFilter,
}: { fixedFilter?: AdminWordFilter } = {}) {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [level, setLevel] = useState<number | undefined>();
  const [chosenFilter, setChosenFilter] = useState<AdminWordFilter>("all");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const filter = fixedFilter ?? chosenFilter;
  const words = useAdminWords({ q: term, level, page, filter });
  const stats = useAdminWordStats();

  function refresh() {
    void words.mutate();
    void stats.mutate();
  }

  return (
    <div className="space-y-4">
      {stats.data && <ReviewProgress {...stats.data} />}
      <form
        role="search"
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(q.trim());
          setPage(1);
        }}
      >
        <input
          aria-label="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…"
          className="field min-w-0 flex-1"
        />
        <LevelSelect
          ariaLabel="Lọc theo cấp độ"
          value={level}
          emptyLabel="Mọi cấp độ"
          onChange={(next) => {
            setLevel(next);
            setPage(1);
          }}
        />
        {!fixedFilter && (
          <select
            aria-label="Lọc theo trạng thái duyệt"
            className="field w-auto"
            value={chosenFilter}
            onChange={(e) => {
              setChosenFilter(e.target.value as AdminWordFilter);
              setPage(1);
            }}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        )}
        <Button type="submit">
          <Icon name="search" size={16} />
          Tìm
        </Button>
      </form>

      {words.error ? (
        <ErrorNote>{errorMessage(words.error, "Chưa tải được từ vựng.")}</ErrorNote>
      ) : words.isLoading ? (
        <Spinner />
      ) : words.data?.items.length ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">
              {words.data.total.toLocaleString("vi-VN")} từ
            </p>
            <ApprovePageButton
              words={words.data.items}
              onDone={refresh}
            />
          </div>
          <ul className="space-y-2">
            {words.data.items.map((w) =>
              editingId === w.id ? (
                <li key={w.id}>
                  <WordEditor
                    word={w}
                    onDone={() => {
                      setEditingId(null);
                      refresh();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <WordRow
                  key={w.id}
                  word={w}
                  onEdit={() => setEditingId(w.id)}
                  onChanged={refresh}
                />
              ),
            )}
          </ul>
          <Pager
            page={page}
            totalPages={words.data.totalPages}
            onChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title={
            filter === "reported" ? "Không có báo lỗi nào" : "Không tìm thấy từ nào"
          }
          description={
            filter === "reported"
              ? "Khi người học bấm 🚩 báo lỗi một từ, từ đó sẽ hiện ở đây."
              : filter === "aiFlagged"
                ? "Chưa có từ nào bị AI nghi ngờ. Chạy `npm run data:check-words` trong thư mục server để AI soát từ vựng."
                : "Thử từ khoá khác hoặc bỏ bớt bộ lọc."
          }
        />
      )}
    </div>
  );
}

/** Approves every not-yet-approved word on the current page in one go, for
 * words the admin has skimmed and found correct. */
function ApprovePageButton({
  words,
  onDone,
}: {
  words: AdminWord[];
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = words.filter((w) => w.reviewedAt === null);
  if (pending.length === 0) return null;

  async function approve() {
    const flagged = pending.filter((w) => w.aiFlag || w._count.reports > 0);
    const warning = flagged.length
      ? `\n\nLưu ý: ${flagged.length} từ trong số này đang bị AI nghi ngờ hoặc bị báo lỗi.`
      : "";
    if (
      !window.confirm(
        `Đánh dấu ${pending.length} từ chưa duyệt trên trang này là đã duyệt?${warning}`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await reviewAdminWords(pending.map((w) => w.id));
      onDone();
    } catch (err) {
      setError(errorMessage(err, "Chưa duyệt được trang này."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <Button variant="secondary" onClick={() => void approve()} disabled={busy}>
        <Icon name="check" size={15} />
        {busy ? "Đang duyệt…" : `Duyệt cả trang (${pending.length} từ)`}
      </Button>
    </div>
  );
}

function ReviewProgress({
  total,
  reviewed,
  reported,
  aiFlagged,
}: {
  total: number;
  reviewed: number;
  reported: number;
  aiFlagged: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
        <span>
          Đã duyệt <strong>{reviewed.toLocaleString("vi-VN")}</strong> /{" "}
          {total.toLocaleString("vi-VN")} từ
        </span>
        <span className="flex flex-wrap gap-3">
          {reported > 0 && (
            <span className="flex items-center gap-1 text-warn">
              <Icon name="flag" size={14} />
              {reported.toLocaleString("vi-VN")} từ bị báo lỗi
            </span>
          )}
          {aiFlagged > 0 && (
            <span className="flex items-center gap-1 text-warn">
              <Icon name="spark" size={14} />
              {aiFlagged.toLocaleString("vi-VN")} từ AI nghi ngờ
            </span>
          )}
        </span>
      </div>
      <ProgressBar
        value={total ? (reviewed / total) * 100 : 0}
        label="Tiến độ duyệt nội dung do AI sinh"
      />
    </div>
  );
}

function WordRow({
  word,
  onEdit,
  onChanged,
}: {
  word: AdminWord;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reviewed = word.reviewedAt !== null;
  const openReports = word._count.reports;

  async function setReviewed(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      await updateAdminWord(word.id, { reviewed: next });
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Chưa cập nhật được trạng thái duyệt."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            <span lang="en">{word.word}</span>{" "}
            <span className="text-sm font-normal text-muted">
              {word.pronunciation}
            </span>
          </p>
          <p className="text-sm">
            {word.meaningVi ?? (
              <span className="italic text-muted">Chưa có nghĩa</span>
            )}
          </p>
          {word.examples[0] && (
            <p className="mt-1 text-xs text-muted" lang="en">
              {word.examples[0].en}
              {word.examples[0].vi && (
                <span lang="vi"> — {word.examples[0].vi}</span>
              )}
            </p>
          )}
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            {levelLabel(word.level)}
            <span
              className={`rounded-md px-1.5 py-0.5 font-semibold ${reviewed ? "bg-good/10 text-good" : "bg-surface-2 text-muted"}`}
            >
              {reviewed ? "Đã duyệt" : "Chưa duyệt"}
            </span>
            {openReports > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-warn/10 px-1.5 py-0.5 font-semibold text-warn">
                <Icon name="flag" size={12} />
                {openReports} báo lỗi
              </span>
            )}
            {word.aiFlag && (
              <span className="flex items-center gap-1 rounded-md bg-warn/10 px-1.5 py-0.5 font-semibold text-warn">
                <Icon name="spark" size={12} />
                AI nghi ngờ
              </span>
            )}
          </p>
          {word.aiFlag && (
            <p className="mt-1 text-xs text-warn">AI: {word.aiFlag}</p>
          )}
        </div>
        <div className="flex gap-2">
          {reviewed ? (
            <Button
              variant="secondary"
              onClick={() => void setReviewed(false)}
              disabled={busy}
            >
              Bỏ duyệt
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => void setReviewed(true)}
              disabled={busy}
              title="Nội dung đúng — đánh dấu đã duyệt, đóng các báo lỗi và bỏ nghi ngờ của AI"
            >
              <Icon name="check" size={15} />
              Đúng rồi
            </Button>
          )}
          <Button variant="secondary" onClick={onEdit} disabled={busy}>
            <Icon name="pencil" size={15} />
            Sửa
          </Button>
        </div>
      </div>
      {word.reports.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-2 text-xs">
          {word.reports.map((r) => (
            <li key={r.id}>
              <span className="font-semibold text-warn">
                {reportReasonLabel(r.reason)}
              </span>
              {r.note && <span> — “{r.note}”</span>}
              <span className="text-muted">
                {" "}
                · {r.user.displayName} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div className="mt-2">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
    </li>
  );
}

function WordEditor({
  word,
  onDone,
  onCancel,
}: {
  word: AdminWord;
  onDone: () => void;
  onCancel: () => void;
}) {
  const example = word.examples[0];
  const [text, setText] = useState(word.word);
  const [pronunciation, setPronunciation] = useState(word.pronunciation ?? "");
  const [meaningVi, setMeaningVi] = useState(word.meaningVi ?? "");
  const [meaningEn, setMeaningEn] = useState(word.meaningEn ?? "");
  const [exampleEn, setExampleEn] = useState(example?.en ?? "");
  const [exampleVi, setExampleVi] = useState(example?.vi ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminWord(word.id, {
        word: text,
        pronunciation,
        meaningVi,
        meaningEn,
        // An empty sentence keeps the current example (there is no delete).
        example: exampleEn.trim()
          ? { en: exampleEn, vi: exampleVi }
          : undefined,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err, "Chưa lưu được từ này."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={(e) => void save(e)} className="space-y-4">
        <p className="text-xs text-muted">
          {levelLabel(word.level)} · cấp độ không sửa được ở đây · lưu cũng
          đánh dấu từ là đã duyệt và đóng các báo lỗi
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Từ tiếng Anh">
            <input
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="field"
              lang="en"
            />
          </Field>
          <Field label="Phiên âm IPA" hint="Để trống để xoá.">
            <input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              className="field"
            />
          </Field>
        </div>
        <Field label="Nghĩa tiếng Việt" hint="Để trống để xoá.">
          <input
            value={meaningVi}
            onChange={(e) => setMeaningVi(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Định nghĩa tiếng Anh" hint="Để trống để xoá.">
          <textarea
            rows={2}
            value={meaningEn}
            onChange={(e) => setMeaningEn(e.target.value)}
            className="field"
            lang="en"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Câu ví dụ (tiếng Anh)"
            hint="Để trống thì giữ nguyên câu ví dụ hiện có."
          >
            <textarea
              rows={2}
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              className="field"
              lang="en"
            />
          </Field>
          <Field label="Dịch câu ví dụ">
            <textarea
              rows={2}
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              className="field"
            />
          </Field>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            <Icon name="check" size={16} />
            {busy ? "Đang lưu…" : "Lưu"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Huỷ
          </Button>
        </div>
      </form>
    </Card>
  );
}
