import { ImageResponse } from "next/og";

export const alt = "Lingo — Học tiếng Anh mỗi ngày";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PILLS = [
  "8.600+ từ vựng",
  "Flashcard SRS",
  "Video song ngữ",
  "Trợ lý AI",
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(135deg, #fffaf4 0%, #fff1e6 52%, #ffe4d6 100%)",
          color: "#18181b",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            <span>Lingo</span>
            <span style={{ color: "#e85d3f" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(232, 93, 63, 0.12)",
              color: "#c94326",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            6 cấp độ · Beginner → Advanced
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            Học tiếng Anh thông minh mỗi ngày
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#52525b",
              lineHeight: 1.4,
            }}
          >
            Lộ trình linh hoạt theo chủ đề, ôn flashcard đúng nhịp nhớ và luyện 4 kỹ năng cùng Trợ lý AI.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {PILLS.map((pill) => (
              <div
                key={pill}
                style={{
                  display: "flex",
                  padding: "12px 22px",
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1px solid rgba(24, 24, 27, 0.08)",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#27272a",
                }}
              >
                {pill}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              color: "#71717a",
            }}
          >
            lingo-client.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
