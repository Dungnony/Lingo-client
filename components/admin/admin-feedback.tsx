"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Button, Card, EmptyState, ErrorNote, Spinner } from "@/components/ui";
import {
  deleteAdminFeedback,
  updateAdminFeedbackStatus,
  useAdminFeedback,
} from "@/lib/hooks";
import type { SupportFeedbackItem } from "@/lib/types";
import { errorMessage } from "./admin-shared";

type StatusFilter = "ALL" | "OPEN" | "RESOLVED";

export function AdminFeedback() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const { data, isLoading, error, mutate } = useAdminFeedback(statusFilter);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleStatus(item: SupportFeedbackItem) {
    if (busyId) return;
    setBusyId(item.id);
    setActionError(null);
    const nextStatus = item.status === "OPEN" ? "RESOLVED" : "OPEN";
    try {
      await updateAdminFeedbackStatus(item.id, nextStatus);
      await mutate();
    } catch (err) {
      setActionError(errorMessage(err, "Chưa cập nhật được trạng thái góp ý."));
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(item: SupportFeedbackItem) {
    if (busyId) return;
    setBusyId(item.id);
    setActionError(null);
    try {
      await deleteAdminFeedback(item.id);
      await mutate();
    } catch (err) {
      setActionError(errorMessage(err, "Chưa xoá được góp ý này."));
    } finally {
      setBusyId(null);
    }
  }

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "ALL", label: "Tất cả" },
    {
      key: "OPEN",
      label: data ? `Chờ xử lý (${data.openCount})` : "Chờ xử lý",
    },
    { key: "RESOLVED", label: "Đã xử lý" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Lọc trạng thái góp ý"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={statusFilter === tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`motion-button min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-fg"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          onClick={() => void mutate()}
          className="min-h-9! px-3! py-1.5! text-xs!"
        >
          <Icon name="refresh" size={14} /> Làm mới
        </Button>
      </div>

      {actionError && <ErrorNote>{actionError}</ErrorNote>}

      {error ? (
        <ErrorNote>Chưa tải được danh sách góp ý. Vui lòng thử lại.</ErrorNote>
      ) : isLoading || !data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="Chưa có góp ý nào"
          description="Khi người học gửi phản hồi từ trang Hỗ trợ & Liên hệ, nội dung sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => {
            const busy = busyId === item.id;
            const resolved = item.status === "RESOLVED";
            return (
              <Card key={item.id} className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {item.topic}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-medium ${
                          resolved
                            ? "bg-good/12 text-good"
                            : "bg-accent/12 text-accent"
                        }`}
                      >
                        {resolved ? "Đã xử lý" : "Chờ xử lý"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      <strong className="text-foreground">{item.name}</strong>
                      {" · "}
                      {item.email ?? "Không để lại email"}
                      {" · "}
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={resolved ? "secondary" : "primary"}
                      disabled={busyId !== null}
                      onClick={() => void toggleStatus(item)}
                      className="min-h-8! px-3! py-1! text-xs!"
                    >
                      <Icon name={resolved ? "refresh" : "check"} size={14} />
                      {busy
                        ? "Đang lưu…"
                        : resolved
                          ? "Mở lại"
                          : "Đánh dấu đã xử lý"}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={busyId !== null}
                      onClick={() => void removeItem(item)}
                      className="min-h-8! px-3! py-1! text-xs!"
                    >
                      <Icon name="trash" size={14} />
                      Xoá
                    </Button>
                  </div>
                </div>

                <p className="whitespace-pre-line rounded-xl bg-surface-2/60 p-3.5 text-sm leading-6">
                  {item.message}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
