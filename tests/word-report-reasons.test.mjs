import assert from "node:assert/strict";
import test from "node:test";
import {
  WORD_REPORT_REASONS,
  reportReasonLabel,
} from "../lib/word-report-reasons.ts";

// Must list every value of the server's WordReportReason enum.
const SERVER_REASONS = ["MEANING", "PRONUNCIATION", "EXAMPLE", "OTHER"];

test("offers every reason the server accepts, each with a label", () => {
  assert.deepEqual(
    WORD_REPORT_REASONS.map((r) => r.value),
    SERVER_REASONS,
  );
  for (const r of WORD_REPORT_REASONS) assert.ok(r.label.trim());
});

test("labels a reason in Vietnamese", () => {
  assert.equal(reportReasonLabel("MEANING"), "Nghĩa sai");
});
