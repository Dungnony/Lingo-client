"use client";

import { useState } from "react";
import { EmptyState, LinkButton, PageHeading, Spinner } from "@/components/ui";
import styles from "@/components/learning-library.module.css";
import { SelectionGroup } from "@/components/selection-group";
import { AdminWords } from "@/components/admin/admin-words";
import { AdminGrammar } from "@/components/admin/admin-grammar";
import { AdminVideos } from "@/components/admin/admin-videos";
import { useRequireAuth } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/roles";

type AdminTab = "words" | "reports" | "grammar" | "videos";

const TABS: { value: AdminTab; label: string }[] = [
  { value: "words", label: "Từ vựng" },
  { value: "reports", label: "Báo lỗi" },
  { value: "grammar", label: "Ngữ pháp" },
  { value: "videos", label: "Video" },
];

export default function AdminPage() {
  const { user, loading } = useRequireAuth();
  const [tab, setTab] = useState<AdminTab>("words");
  if (loading || !user) return <Spinner />;

  // Convenience only: every /admin API route is enforced by the server.
  if (user.role !== ADMIN_ROLE) {
    return (
      <div className="page-wrap">
        <EmptyState
          title="Bạn không có quyền vào trang này"
          description="Trang quản trị nội dung chỉ dành cho tài khoản quản trị viên."
        >
          <LinkButton href="/dashboard" variant="secondary">
            Về tổng quan
          </LinkButton>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={`page-wrap ${styles.page}`}>
      <PageHeading
        icon="lock"
        eyebrow="Quản trị viên"
        title="Quản trị nội dung"
        description="Duyệt và sửa nội dung từ do AI soạn, xử lý báo lỗi của người học, soạn điểm ngữ pháp và chỉnh thông tin video."
      />
      <section className={styles.toolbar} aria-label="Chọn loại nội dung">
        <SelectionGroup
          className={styles.levels}
          label="Loại nội dung"
          value={tab}
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={tab === t.value}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </SelectionGroup>
      </section>
      {tab === "words" && <AdminWords />}
      {tab === "reports" && <AdminWords fixedFilter="reported" />}
      {tab === "grammar" && <AdminGrammar />}
      {tab === "videos" && <AdminVideos />}
    </div>
  );
}
