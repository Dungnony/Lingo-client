// Pure data shared by the report button and the admin list. Kept free of React
// and "@/" imports so `node --test` can load this file directly.
import type { WordReportReason } from "./types";

export const WORD_REPORT_REASONS: readonly {
  value: WordReportReason;
  label: string;
}[] = [
  { value: "MEANING", label: "Nghĩa sai" },
  { value: "PRONUNCIATION", label: "Phiên âm sai" },
  { value: "EXAMPLE", label: "Câu ví dụ sai" },
  { value: "OTHER", label: "Lỗi khác" },
];

export function reportReasonLabel(reason: WordReportReason): string {
  return WORD_REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;
}
