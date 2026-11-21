"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import {
  Button,
  Card,
  ErrorNote,
  PageHeading,
  Spinner,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { LEVELS, levelName } from "@/lib/levels";
import type { VideoDetail, VideoKind } from "@/lib/types";
import { VIDEO_KINDS } from "@/lib/video-kinds";

const SUGGESTED_VIDEOS: {
  label: string;
  youtubeUrl: string;
  title: string;
  level: number;
  kind: VideoKind;
  transcript: string;
}[] = [
  {
    label: "Hội thoại quán cà phê (Level 1)",
    youtubeUrl: "https://www.youtube.com/watch?v=P_6vDLq64gE",
    title: "Giao tiếp hàng ngày: Gọi đồ uống và trò chuyện ở quán cà phê",
    level: 1,
    kind: "DIALOGUE",
    transcript: [
      "[00:02] Good morning! Can I get a medium iced latte with oat milk, please? | Chào buổi sáng! Cho mình một ly latte đá cỡ vừa dùng sữa yến mạch nhé?",
      "[00:07] Sure thing. Would you like anything to eat with that today? | Được chứ. Hôm nay bạn có muốn dùng thêm đồ ăn nhẹ gì kèm theo không?",
      "[00:12] Just a warm croissant, please. Is it possible to sit by the window? | Cho mình thêm một bánh sừng bò ấm nhé. Mình ngồi ở bàn cạnh cửa sổ được không?",
      "[00:18] Of course, feel free to take any seat you like. | Tất nhiên rồi, bạn cứ thoải mái chọn chỗ ngồi mình thích nhé.",
      "[00:24] Thank you so much! Have a wonderful morning. | Cảm ơn bạn rất nhiều! Chúc bạn một buổi sáng tốt lành.",
    ].join("\n"),
  },
  {
    label: "TED · Thói quen 30 ngày (Level 3)",
    youtubeUrl: "https://www.youtube.com/watch?v=UNP03fDSj1U",
    title: "Thử một điều mới trong 30 ngày — Matt Cutts (TED)",
    level: 3,
    kind: "PODCAST",
    transcript: [
      "[00:12] A few years ago, I felt like I was stuck in a rut, so I decided to follow in the footsteps of the great American philosopher, Morgan Spurlock. | Vài năm trước, tôi cảm thấy mình đang dậm chân tại chỗ, nên quyết định nối gót triết gia người Mỹ Morgan Spurlock.",
      "[00:21] And try something new for 30 days. The idea is actually pretty simple. | Và thử làm một điều mới mẻ trong suốt 30 ngày. Ý tưởng thực ra rất đơn giản.",
      "[00:27] Think about something you have always wanted to add to your life and try it for the next 30 days. | Hãy nghĩ về một điều bạn luôn muốn thêm vào cuộc sống và thử thực hiện nó trong 30 ngày tới.",
      "[00:34] It turns out 30 days is just about the right amount of time to add a new habit or subtract a habit from your life. | Hoá ra 30 ngày là khoảng thời gian vừa vặn để hình thành một thói quen mới hoặc từ bỏ một thói quen cũ.",
      "[00:43] I also noticed that as I started to do more and harder 30-day challenges, my self-confidence grew. | Tôi cũng nhận thấy khi bắt đầu thực hiện nhiều thử thách 30 ngày khó hơn, sự tự tin của tôi tăng lên rõ rệt.",
    ].join("\n"),
  },
];

export default function AddVideoPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<number | undefined>();
  const [kind, setKind] = useState<VideoKind | undefined>();
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading || !user) return <Spinner />;

  function applySuggestion(preset: (typeof SUGGESTED_VIDEOS)[number]) {
    setYoutubeUrl(preset.youtubeUrl);
    setTitle(preset.title);
    setLevel(preset.level);
    setKind(preset.kind);
    setTranscript(preset.transcript);
    setShowMore(true);
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const video = await api.post<VideoDetail>("/videos", {
        youtubeUrl: youtubeUrl.trim(),
        title: title.trim() || undefined,
        level,
        kind,
        transcript: transcript.trim() || undefined,
      });
      router.push(`/watch/${video.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Chưa thêm được video. Kiểm tra lại đường dẫn YouTube.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="page-wrap max-w-2xl! space-y-6">
      <PageHeading
        icon="plus"
        tone="good"
        eyebrow="Góp thêm câu chuyện"
        title="Thêm video của bạn"
        description="Dán đường dẫn YouTube có phụ đề tiếng Anh — Lingo tự lấy bản chép + dịch nghĩa cho bạn."
      />
      <Card>
        <div className="mb-5 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
          <p className="text-xs font-semibold text-primary">
            💡 Điền nhanh mẫu video song ngữ có sẵn:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_VIDEOS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applySuggestion(preset)}
                className="rounded-lg border border-primary/20 bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={(e) => void submit(e)} className="space-y-5">
          <label className="block text-sm font-medium">
            Đường dẫn YouTube
            <input
              type="url"
              required
              minLength={5}
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="field mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted">
              Video cần có phụ đề (CC) tiếng Anh trên YouTube để Lingo lấy
              được bản chép tự động.
            </p>
          </label>

          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="text-sm font-semibold text-primary"
            >
              + Thêm chi tiết &amp; bản chép phụ đề (tuỳ chọn)
            </button>
          ) : (
            <div className="space-y-4 border-t border-border pt-4">
              <label className="block text-sm font-medium">
                Tiêu đề (tuỳ chọn)
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Để trống sẽ tự lấy tiêu đề từ YouTube"
                  className="field mt-1.5"
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-medium">Cấp độ (tuỳ chọn)</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {LEVELS.map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setLevel(level === lv ? undefined : lv)}
                      aria-pressed={level === lv}
                      title={levelName(lv)}
                      className={`min-h-9 rounded-lg text-sm font-semibold transition-colors ${
                        level === lv
                          ? "bg-primary text-primary-fg"
                          : "bg-surface-2 text-muted hover:text-foreground"
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Thể loại (tuỳ chọn)</p>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_KINDS.map((k) => (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() =>
                        setKind(kind === k.value ? undefined : k.value)
                      }
                      aria-pressed={kind === k.value}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        kind === k.value
                          ? "border-primary/40 bg-primary/8 text-primary"
                          : "border-border bg-surface text-muted hover:text-foreground"
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-sm font-medium">
                Bản chép phụ đề (tuỳ chọn — dùng khi video không bật sẵn CC trên YouTube)
                <textarea
                  rows={5}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    "Mỗi câu 1 dòng. Có thể kèm mốc [mm:ss] và nghĩa tiếng Việt sau dấu |:\n[00:05] Hello everyone, welcome back! | Chào mọi người, chào mừng quay lại!\n[00:10] Let's practice speaking English together."
                  }
                  className="field mt-1.5 font-mono text-xs"
                />
                <p className="mt-1 text-xs text-muted">
                  Nếu chỉ dán câu tiếng Anh, Lingo sẽ tự động dịch nghĩa tiếng
                  Việt cho từng dòng.
                </p>
              </label>
            </div>
          )}

          {error && <ErrorNote>{error}</ErrorNote>}

          <Button type="submit" disabled={busy || !youtubeUrl.trim()}>
            <Icon name="plus" size={16} />
            {busy ? "Đang thêm…" : "Thêm video"}
          </Button>
          <p className="text-xs leading-5 text-muted">
            Lấy phụ đề từ YouTube có thể mất vài giây. Bản chép tiếng Anh
            hiện ngay sau khi thêm — nghĩa tiếng Việt từng dòng sẽ dịch dần
            trong nền, có thể chưa hiện đủ ngay lập tức.
          </p>
        </form>
      </Card>
    </div>
  );
}
