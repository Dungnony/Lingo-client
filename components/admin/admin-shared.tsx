"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icon";
import { ApiError } from "@/lib/api";
import { LEVELS, levelLabel } from "@/lib/levels";

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <span className="mt-1.5 block">{children}</span>
      {hint && <p className="mt-1 text-xs font-normal text-muted">{hint}</p>}
    </label>
  );
}

/** `emptyLabel` adds an empty option, e.g. "every level" for filters or
 * "not set" for forms. */
export function LevelSelect({
  value,
  onChange,
  emptyLabel,
  ariaLabel,
}: {
  value: number | undefined;
  onChange: (level: number | undefined) => void;
  emptyLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      className="field w-auto"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : undefined)
      }
    >
      {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
      {LEVELS.map((lv) => (
        <option key={lv} value={lv}>
          {levelLabel(lv)}
        </option>
      ))}
    </select>
  );
}

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <Icon name="back" size={16} />
        Trước
      </Button>
      <span className="text-sm text-muted" aria-live="polite">
        Trang {page} / {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Sau
        <Icon name="arrow" size={16} />
      </Button>
    </div>
  );
}
