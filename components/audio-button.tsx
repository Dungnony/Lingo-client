"use client";

import { useWordAudio } from "./practice/use-word-audio";
import { Icon } from "./icon";

/** Phát bản thu của từ; không có bản thu thì đọc `text` bằng giọng đọc
 * tiếng Anh của trình duyệt. Dừng âm thanh khi chuyển bài/trang. */
export function AudioButton({
  src,
  text,
  size = 18,
  className = "",
}: {
  src?: string | null;
  text?: string | null;
  size?: number;
  className?: string;
}) {
  const audio = useWordAudio(text ?? "", src);
  if (!src && !text) return null;
  const failed = Boolean(audio.error);

  function play(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    audio.play();
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={play}
        aria-label={audio.playing ? "Phát lại từ đầu" : "Nghe phát âm"}
        title={audio.error ?? "Nghe phát âm"}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-primary ${audio.playing ? "text-primary" : ""} ${className}`}
      >
        <Icon name={failed ? "refresh" : "sound"} size={size} />
      </button>
      {failed && (
        <span role="status" className="text-[10px] font-normal text-danger">
          Chưa phát được
        </span>
      )}
    </span>
  );
}
