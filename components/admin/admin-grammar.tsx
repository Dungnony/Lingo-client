"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, EmptyState, ErrorNote, Spinner } from "@/components/ui";
import { Icon } from "@/components/icon";
import {
  formatExampleLines,
  linesToList,
  parseExampleLines,
} from "@/lib/admin-form";
import {
  createAdminGrammar,
  deleteAdminGrammar,
  updateAdminGrammar,
  useAdminGrammar,
} from "@/lib/hooks";
import { levelLabel, LEVELS } from "@/lib/levels";
import type { AdminGrammarPoint } from "@/lib/types";
import { errorMessage, Field, LevelSelect } from "./admin-shared";

/** "new" opens an empty form; a point id opens that point's form. */
type Editing = "new" | string | null;

export function AdminGrammar() {
  const [level, setLevel] = useState<number | undefined>();
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);
  const grammar = useAdminGrammar(level);

  function done() {
    setEditing(null);
    void grammar.mutate();
  }

  async function remove(point: AdminGrammarPoint) {
    if (!window.confirm(`Xoá điểm ngữ pháp "${point.titleVi}"?`)) return;
    setError(null);
    try {
      await deleteAdminGrammar(point.id);
      void grammar.mutate();
    } catch (err) {
      setError(errorMessage(err, "Chưa xoá được điểm ngữ pháp."));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <LevelSelect
          ariaLabel="Lọc theo cấp độ"
          value={level}
          emptyLabel="Mọi cấp độ"
          onChange={setLevel}
        />
        <Button
          className="ml-auto"
          onClick={() => setEditing("new")}
          disabled={editing === "new"}
        >
          <Icon name="plus" size={16} />
          Thêm điểm ngữ pháp
        </Button>
      </div>

      {editing === "new" && (
        <GrammarEditor
          point={null}
          defaultLevel={level ?? LEVELS[0]}
          onDone={done}
          onCancel={() => setEditing(null)}
        />
      )}
      {error && <ErrorNote>{error}</ErrorNote>}

      {grammar.error ? (
        <ErrorNote>
          {errorMessage(grammar.error, "Chưa tải được ngữ pháp.")}
        </ErrorNote>
      ) : grammar.isLoading ? (
        <Spinner />
      ) : grammar.data?.length ? (
        <ul className="space-y-2">
          {grammar.data.map((point) =>
            editing === point.id ? (
              <li key={point.id}>
                <GrammarEditor
                  point={point}
                  defaultLevel={point.level}
                  onDone={done}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li
                key={point.id}
                className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{point.titleVi}</p>
                  <p className="text-sm text-muted">
                    {levelLabel(point.level)} ·{" "}
                    <Link
                      href={`/grammar/${point.slug}`}
                      className="underline"
                    >
                      {point.slug}
                    </Link>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(point.id)}
                  >
                    <Icon name="pencil" size={15} />
                    Sửa
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => void remove(point)}
                    aria-label={`Xoá ${point.titleVi}`}
                  >
                    <Icon name="trash" size={15} />
                  </Button>
                </div>
              </li>
            ),
          )}
        </ul>
      ) : (
        <EmptyState
          title="Chưa có điểm ngữ pháp"
          description="Bấm “Thêm điểm ngữ pháp” để soạn điểm đầu tiên cho cấp này."
        />
      )}
    </div>
  );
}

function GrammarEditor({
  point,
  defaultLevel,
  onDone,
  onCancel,
}: {
  point: AdminGrammarPoint | null;
  defaultLevel: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(point?.slug ?? "");
  const [level, setLevel] = useState(point?.level ?? defaultLevel);
  const [titleVi, setTitleVi] = useState(point?.titleVi ?? "");
  const [titleEn, setTitleEn] = useState(point?.titleEn ?? "");
  const [summaryVi, setSummaryVi] = useState(point?.summaryVi ?? "");
  const [explanationVi, setExplanationVi] = useState(
    point?.explanationVi ?? "",
  );
  const [patterns, setPatterns] = useState(point?.patterns.join("\n") ?? "");
  const [examples, setExamples] = useState(
    point ? formatExampleLines(point.examples) : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseExampleLines(examples);
    if (parsed.invalidLines.length) {
      setError(
        `Dòng ví dụ ${parsed.invalidLines.join(", ")} thiếu câu tiếng Anh.`,
      );
      return;
    }
    if (!parsed.examples.length) {
      setError("Cần ít nhất 1 câu ví dụ.");
      return;
    }
    const body = {
      level,
      titleVi,
      titleEn,
      summaryVi,
      explanationVi,
      patterns: linesToList(patterns),
      examples: parsed.examples,
    };
    setBusy(true);
    setError(null);
    try {
      if (point) await updateAdminGrammar(point.id, body);
      else await createAdminGrammar({ ...body, slug: slug.trim() });
      onDone();
    } catch (err) {
      setError(errorMessage(err, "Chưa lưu được điểm ngữ pháp."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={(e) => void save(e)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Slug (đường dẫn)"
            hint={
              point
                ? "Không đổi được sau khi tạo."
                : "Chữ thường, số và dấu gạch ngang, vd present-simple."
            }
          >
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!!point}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              className="field"
            />
          </Field>
          <Field label="Cấp độ">
            <LevelSelect
              value={level}
              onChange={(next) => setLevel(next ?? defaultLevel)}
            />
          </Field>
          <Field label="Tiêu đề tiếng Việt">
            <input
              required
              value={titleVi}
              onChange={(e) => setTitleVi(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Tiêu đề tiếng Anh">
            <input
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="field"
              lang="en"
            />
          </Field>
        </div>
        <Field label="Tóm tắt (1–2 câu)">
          <textarea
            rows={2}
            value={summaryVi}
            onChange={(e) => setSummaryVi(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Giải thích" hint="Xuống dòng để tách đoạn.">
          <textarea
            rows={6}
            value={explanationVi}
            onChange={(e) => setExplanationVi(e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Mẫu câu" hint="Mỗi dòng 1 mẫu.">
          <textarea
            rows={3}
            value={patterns}
            onChange={(e) => setPatterns(e.target.value)}
            className="field font-mono text-sm"
            lang="en"
          />
        </Field>
        <Field
          label="Ví dụ"
          hint="Mỗi dòng 1 câu: Câu tiếng Anh | Bản dịch tiếng Việt"
        >
          <textarea
            rows={4}
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="field"
          />
        </Field>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            <Icon name="check" size={16} />
            {busy ? "Đang lưu…" : point ? "Lưu thay đổi" : "Tạo điểm ngữ pháp"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Huỷ
          </Button>
        </div>
      </form>
    </Card>
  );
}
