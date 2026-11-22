"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";
import { isServerWarming, subscribeSlowApi } from "@/lib/api";
import { usePwaState } from "@/lib/pwa/store";

export function ConnectivityNotice() {
  const { online } = usePwaState();
  const warming = useSyncExternalStore(
    subscribeSlowApi,
    isServerWarming,
    () => false,
  );

  if (!online) {
    return (
      <div
        role="status"
        className="fixed inset-x-4 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-start gap-2 rounded-xl border border-warn/25 bg-surface px-4 py-3 text-xs leading-6 text-foreground shadow-lg"
      >
        <Icon name="info" size={17} className="mt-0.5 shrink-0 text-warn" />
        <span>
          Thiết bị đang mất mạng. Kết nối lại trước khi gửi bài hoặc lưu thay đổi.
        </span>
      </div>
    );
  }

  if (warming) {
    return (
      <div
        role="status"
        className="fixed inset-x-4 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl border border-primary/20 bg-surface px-4 py-2.5 text-xs text-muted shadow-lg"
      >
        <Icon name="clock" size={16} className="shrink-0 text-primary" />
        <span>
          Máy chủ đang khởi động lại sau thời gian nghỉ, vui lòng đợi vài giây…
        </span>
      </div>
    );
  }

  return null;
}
