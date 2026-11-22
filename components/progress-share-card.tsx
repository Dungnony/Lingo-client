"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";

export interface ProgressShareProps {
  displayName: string;
  learned: number;
  learning: number;
  totalWords: number;
  completionPct: number;
  currentStreak: number;
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function ProgressShareButton(props: ProgressShareProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Icon name="share" size={16} />
        Chia sẻ thành tích
      </Button>
      {open && (
        <ProgressShareModal {...props} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ProgressShareModal({
  displayName,
  learned,
  learning,
  totalWords,
  completionPct,
  currentStreak,
  onClose,
}: ProgressShareProps & { onClose: () => void }) {
  const titleId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080;
    const H = 600;

    // Nền gradient ấm
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fffaf4");
    bg.addColorStop(0.55, "#fff0e5");
    bg.addColorStop(1, "#ffe3d3");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Thẻ chính ở giữa
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(24, 24, 27, 0.08)";
    ctx.lineWidth = 2;
    fillRoundRect(ctx, 48, 44, W - 96, H - 88, 32);
    ctx.fill();
    ctx.stroke();

    // Logo Lingo.
    ctx.fillStyle = "#18181b";
    ctx.font = "800 42px system-ui, -apple-system, sans-serif";
    ctx.fillText("Lingo", 96, 118);
    const logoWidth = ctx.measureText("Lingo").width;
    ctx.fillStyle = "#e85d3f";
    ctx.fillText(".", 96 + logoWidth, 118);

    // Pill tiêu đề góc phải
    ctx.fillStyle = "rgba(232, 93, 63, 0.12)";
    fillRoundRect(ctx, W - 380, 78, 284, 48, 24);
    ctx.fill();
    ctx.fillStyle = "#c94326";
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("HÀNH TRÌNH HỌC TIẾNG ANH", W - 356, 109);

    // Tên học viên
    ctx.fillStyle = "#52525b";
    ctx.font = "500 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("Học viên", 96, 184);
    ctx.fillStyle = "#18181b";
    ctx.font = "800 44px system-ui, -apple-system, sans-serif";
    ctx.fillText(displayName || "Người học Lingo", 96, 236);

    // 3 ô số liệu
    const stats = [
      {
        label: "CHUỖI NGÀY HỌC",
        value: `🔥 ${currentStreak} ngày`,
        bg: "rgba(232, 93, 63, 0.09)",
        accent: "#c94326",
      },
      {
        label: "TỪ ĐÃ THUỘC",
        value: `${learned.toLocaleString("vi-VN")} từ`,
        bg: "rgba(22, 163, 74, 0.09)",
        accent: "#15803d",
      },
      {
        label: "ĐANG GHI NHỚ",
        value: `${learning.toLocaleString("vi-VN")} từ`,
        bg: "rgba(37, 99, 235, 0.09)",
        accent: "#1d4ed8",
      },
    ];

    const boxW = 276;
    const gap = 30;
    stats.forEach((s, i) => {
      const bx = 96 + i * (boxW + gap);
      const by = 276;
      ctx.fillStyle = s.bg;
      fillRoundRect(ctx, bx, by, boxW, 132, 22);
      ctx.fill();

      ctx.fillStyle = "#52525b";
      ctx.font = "700 16px system-ui, -apple-system, sans-serif";
      ctx.fillText(s.label, bx + 24, by + 44);

      ctx.fillStyle = s.accent;
      ctx.font = "800 34px system-ui, -apple-system, sans-serif";
      ctx.fillText(s.value, bx + 24, by + 98);
    });

    // Thanh tiến độ
    ctx.fillStyle = "#52525b";
    ctx.font = "600 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `Hoàn thành ${completionPct}% trong ${totalWords.toLocaleString("vi-VN")} từ vựng lộ trình`,
      96,
      456,
    );

    const barW = W - 192;
    ctx.fillStyle = "#f4f4f5";
    fillRoundRect(ctx, 96, 474, barW, 18, 9);
    ctx.fill();

    const fillW = Math.max(18, Math.round((barW * Math.min(100, completionPct)) / 100));
    ctx.fillStyle = "#e85d3f";
    fillRoundRect(ctx, 96, 474, fillW, 18, 9);
    ctx.fill();

    // Chân trang
    ctx.fillStyle = "#71717a";
    ctx.font = "600 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("lingo-client.vercel.app", 96, 532);
  }, [displayName, learned, learning, totalWords, completionPct, currentStreak]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "lingo-thanh-tich.png";
    link.click();
    setNotice("Đã tải ảnh thành tích về máy!");
  }

  async function shareCard() {
    const shareText = `Mình đã giữ chuỗi ${currentStreak} ngày học tiếng Anh và đang ghi nhớ ${learned + learning} từ vựng cùng Lingo!`;
    const shareUrl = `${window.location.origin}/`;
    const canvas = canvasRef.current;

    if (canvas && navigator.share) {
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (blob) {
          const file = new File([blob], "lingo-thanh-tich.png", {
            type: "image/png",
          });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title: "Thành tích học Lingo",
              text: shareText,
              files: [file],
            });
            return;
          }
        }
        await navigator.share({
          title: "Thành tích học Lingo",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Người dùng đóng hộp thoại chia sẻ
      }
    }

    try {
      await navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
      setNotice("Đã sao chép lời chia sẻ + link Lingo!");
    } catch {
      setNotice("Bạn có thể tải ảnh PNG bên cạnh để đăng lên Threads/Facebook.");
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel relative w-full max-w-2xl space-y-4 rounded-2xl bg-surface p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">Lingo Card</p>
            <h2 id={titleId} className="text-lg font-bold">
              Thẻ thành tích học tập
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={1080}
          height={600}
          aria-label="Thẻ ảnh thành tích học Lingo"
          className="h-auto w-full rounded-2xl border border-border"
        />

        {notice && (
          <p role="status" className="text-center text-xs font-medium text-good">
            {notice}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={downloadPng}>
            <Icon name="check" size={16} />
            Tải ảnh PNG
          </Button>
          <Button onClick={() => void shareCard()}>
            <Icon name="share" size={16} />
            Chia sẻ ngay
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
