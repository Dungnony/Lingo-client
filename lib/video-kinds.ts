import type { VideoKind } from "./types";

/** Video categories in display order, shared by the library filter, the
 * "add video" form and video cards. */
export const VIDEO_KINDS: readonly { value: VideoKind; label: string }[] = [
  { value: "LESSON", label: "Bài giảng" },
  { value: "STORY", label: "Truyện ngắn" },
  { value: "DIALOGUE", label: "Hội thoại" },
  { value: "PODCAST", label: "Podcast" },
  { value: "NEWS", label: "Tin tức" },
  { value: "SONG", label: "Bài hát" },
  { value: "CLIP", label: "Clip ngắn" },
  { value: "OTHER", label: "Khác" },
];

export function videoKindLabel(kind: string): string {
  return VIDEO_KINDS.find((k) => k.value === kind)?.label ?? kind;
}
