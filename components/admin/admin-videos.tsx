"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, EmptyState, ErrorNote, Spinner } from "@/components/ui";
import { Icon } from "@/components/icon";
import { deleteVideo, updateAdminVideo, useAdminVideos } from "@/lib/hooks";
import type { AdminVideo, VideoKind } from "@/lib/types";
import { VIDEO_KINDS } from "@/lib/video-kinds";
import { errorMessage, Field, LevelSelect, Pager } from "./admin-shared";

export function AdminVideos() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const videos = useAdminVideos({ q: term, page });

  return (
    <div className="space-y-4">
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
          aria-label="Tìm video theo tiêu đề"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tiêu đề…"
          className="field min-w-0 flex-1"
        />
        <Button type="submit">
          <Icon name="search" size={16} />
          Tìm
        </Button>
      </form>

      {videos.error ? (
        <ErrorNote>{errorMessage(videos.error, "Chưa tải được video.")}</ErrorNote>
      ) : videos.isLoading ? (
        <Spinner />
      ) : videos.data?.items.length ? (
        <>
          <ul className="space-y-3">
            {videos.data.items.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                onChanged={() => void videos.mutate()}
              />
            ))}
          </ul>
          <Pager
            page={page}
            totalPages={videos.data.totalPages}
            onChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title="Chưa có video nào"
          description="Video do người dùng thêm ở trang Học qua video sẽ hiện ở đây."
        />
      )}
    </div>
  );
}

function VideoRow({
  video,
  onChanged,
}: {
  video: AdminVideo;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(video.title);
  const [titleEn, setTitleEn] = useState(video.titleEn ?? "");
  const [level, setLevel] = useState(video.level ?? undefined);
  const [kind, setKind] = useState<VideoKind>(video.kind);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      // The API cannot unset a level, so only send one that was chosen.
      await updateAdminVideo(video.id, { title, titleEn, kind, level });
      setStatus("Đã lưu");
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Chưa lưu được video."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Xoá video "${video.title}"? Không hoàn tác được.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteVideo(video.id);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, "Chưa xoá được video."));
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-surface px-4 py-4">
      <form onSubmit={(e) => void save(e)} className="space-y-3">
        <p className="text-xs text-muted">
          <Link href={`/watch/${video.id}`} className="underline">
            Mở video
          </Link>{" "}
          · thêm bởi {video.createdBy?.displayName ?? "hệ thống"} ·{" "}
          {new Date(video.createdAt).toLocaleDateString("vi-VN")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tiêu đề">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Tiêu đề tiếng Anh" hint="Để trống để xoá.">
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="field"
              lang="en"
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Cấp độ">
            <LevelSelect
              value={level}
              emptyLabel={level === undefined ? "Chưa đặt" : undefined}
              onChange={setLevel}
            />
          </Field>
          <Field label="Thể loại">
            <select
              className="field w-auto"
              value={kind}
              onChange={(e) => setKind(e.target.value as VideoKind)}
            >
              {VIDEO_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="ml-auto flex items-center gap-2">
            {status && (
              <span role="status" className="text-xs text-good">
                {status}
              </span>
            )}
            <Button type="submit" disabled={busy}>
              <Icon name="check" size={16} />
              Lưu
            </Button>
            <Button
              variant="secondary"
              onClick={() => void remove()}
              disabled={busy}
              aria-label={`Xoá video ${video.title}`}
            >
              <Icon name="trash" size={15} />
            </Button>
          </div>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
      </form>
    </li>
  );
}
