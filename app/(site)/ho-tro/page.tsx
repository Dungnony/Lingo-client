"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon, type IconName } from "@/components/icon";
import {
  Button,
  Card,
  ErrorNote,
  LinkButton,
  PageHeading,
  SectionHeading,
} from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { submitSupportFeedback } from "@/lib/hooks";

const SUPPORT_EMAIL = "nguyendungsenpai109@gmail.com";

const SUPPORT_CHANNELS: {
  icon: IconName;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  external?: boolean;
}[] = [
  {
    icon: "mail",
    title: "Email hỗ trợ trực tiếp",
    description:
      "Gửi câu hỏi về tài khoản, khôi phục tiến độ học hoặc đóng góp ý kiến trực tiếp tới đội ngũ phát triển Lingo.",
    actionLabel: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("[Lingo] Yêu cầu hỗ trợ")}`,
    external: true,
  },
  {
    icon: "flag",
    title: "Báo lỗi từ vựng & nội dung",
    description:
      "Khi gặp một từ có nghĩa tiếng Việt, phiên âm IPA hoặc câu ví dụ chưa tự nhiên, bấm biểu tượng 🚩 ngay cạnh nút lưu từ (♥) để đội ngũ biên tập duyệt lại.",
    actionLabel: "Mở thư viện từ vựng",
    href: "/vocabulary",
  },
  {
    icon: "message",
    title: "Kết nối cộng đồng người học",
    description:
      "Tìm bạn học cùng cấp độ, trao đổi kinh nghiệm trực tiếp qua tin nhắn 1-1 và có ngay khung dịch nhanh trong hội thoại.",
    actionLabel: "Tìm bạn cùng học",
    href: "/messages?tab=connect",
  },
  {
    icon: "spark",
    title: "Trợ lý học tập AI 24/7",
    description:
      "Bấm biểu tượng Trợ lý Lingo ở góc dưới bên phải màn hình để hỏi nhanh về ngữ pháp, cách phân biệt từ vựng và gợi ý bài học.",
    actionLabel: "Vào góc học tập",
    href: "/dashboard",
  },
];

const TROUBLESHOOTING: {
  icon: IconName;
  question: string;
  steps: string[];
}[] = [
  {
    icon: "sound",
    question: "Không nghe được âm thanh khi bấm nút loa phát âm?",
    steps: [
      "Lingo sử dụng bộ đọc giọng nói tiếng Anh (Web Speech API) tích hợp sẵn trên trình duyệt của bạn.",
      "Kiểm tra xem tab trình duyệt có đang bị tắt tiếng (Mute site) hoặc thiết bị đang để chế độ im lặng không.",
      "Trên điện thoại iOS/Android hoặc Windows, hãy ưu tiên sử dụng trình duyệt Chrome, Edge hoặc Safari bản mới nhất để có giọng đọc tiếng Anh rõ và tự nhiên nhất.",
    ],
  },
  {
    icon: "mic",
    question: "Mục Luyện phát âm báo không nhận diện được micro?",
    steps: [
      "Khi trình duyệt hỏi quyền sử dụng micro, hãy chọn \"Cho phép\" (Allow). Nếu lỡ bấm chặn, bấm vào biểu tượng ổ khoá cạnh thanh địa chỉ trình duyệt để bật lại quyền Micro.",
      "Tính năng nhận diện giọng nói hoạt động tốt nhất trên Google Chrome và Microsoft Edge.",
      "Đọc rõ từng từ ở nơi ít tạp âm và giữ khoảng cách 15–25 cm với micro.",
    ],
  },
  {
    icon: "play",
    question: "Thêm video YouTube mới nhưng báo chưa lấy được phụ đề?",
    steps: [
      "Một số video YouTube không bật sẵn phụ đề tiếng Anh (CC) công khai hoặc hạn chế truy cập tự động.",
      "Tại trang \"Thêm video\", bạn có thể mở mục \"+ Thêm chi tiết & bản chép phụ đề\" để dán trực tiếp các câu tiếng Anh (hoặc chọn 1 trong các mẫu video song ngữ gợi ý sẵn).",
      "Lingo sẽ tự động tách câu, canh nhịp thời gian và dịch nghĩa tiếng Việt cho các câu bạn dán vào.",
    ],
  },
  {
    icon: "lock",
    question: "Quên mật khẩu hoặc không thấy email xác minh tài khoản?",
    steps: [
      "Kiểm tra thêm hộp thư Quảng cáo (Promotions) hoặc Thư rác (Spam) trong hộp thư điện tử của bạn.",
      "Bạn cũng có thể đăng nhập nhanh bằng nút \"Tiếp tục với Google\" nếu dùng chung địa chỉ Gmail — hệ thống sẽ tự động xác minh và đồng bộ tài khoản.",
    ],
  },
];

const TOPIC_OPTIONS = [
  { value: "Hỗ trợ tài khoản & đăng nhập", label: "Hỗ trợ tài khoản & đăng nhập" },
  { value: "Góp ý từ vựng / ngữ pháp / bài học", label: "Góp ý từ vựng / ngữ pháp / bài học" },
  { value: "Báo lỗi kỹ thuật hoặc giao diện", label: "Báo lỗi kỹ thuật hoặc giao diện" },
  { value: "Hỗ trợ tính năng Học qua video", label: "Hỗ trợ tính năng Học qua video" },
  { value: "Đề xuất tính năng mới cho Lingo", label: "Đề xuất tính năng mới cho Lingo" },
];

export default function SupportPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0].value);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 5) {
      setSubmitError("Vui lòng nhập nội dung chi tiết tối thiểu 5 ký tự.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const senderName = name.trim() || user?.displayName || "Học viên Lingo";
    const senderEmail = email.trim() || user?.email || undefined;
    try {
      await submitSupportFeedback({
        name: senderName,
        email: senderEmail,
        topic,
        message: trimmedMessage,
      });
      setSubmitted(true);
    } catch {
      setSubmitError(
        "Chưa gửi được lúc này. Bạn thử lại sau vài giây hoặc gửi qua ứng dụng Email bên dưới.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `[Lingo] ${topic}`,
  )}&body=${encodeURIComponent(
    `Người gửi: ${name || user?.displayName || "Học viên Lingo"}\nEmail liên hệ: ${
      email || user?.email || "Chưa cung cấp"
    }\n\nNội dung:\n${message}`,
  )}`;

  return (
    <div className="page-wrap space-y-10">
      <PageHeading
        icon="info"
        tone="primary"
        eyebrow="Luôn lắng nghe và đồng hành"
        title="Trung tâm Hỗ trợ & Liên hệ"
        description="Giải đáp thắc mắc khi học tập, hướng dẫn khắc phục sự cố nhanh và kênh liên hệ trực tiếp với đội ngũ phát triển Lingo."
      >
        <LinkButton href={user ? "/dashboard" : "/learn"} variant="secondary">
          <Icon name="arrow" size={16} />
          {user ? "Về góc học tập" : "Khám phá lộ trình"}
        </LinkButton>
      </PageHeading>

      <section aria-label="Các kênh hỗ trợ">
        <SectionHeading
          icon="spark"
          tone="primary"
          title="Kênh hỗ trợ & kết nối nhanh"
          description="Chọn kênh phù hợp nhất với nhu cầu của bạn"
          className="mb-4"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT_CHANNELS.map((item) => (
            <Card key={item.title} className="flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <span className="icon-tile">
                  <Icon name={item.icon} size={19} />
                </span>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="text-xs leading-6 text-muted">
                  {item.description}
                </p>
              </div>
              {item.external ? (
                <a
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  {item.actionLabel}
                  <Icon name="arrow" size={14} />
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  {item.actionLabel}
                  <Icon name="arrow" size={14} />
                </Link>
              )}
            </Card>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section aria-label="Gửi yêu cầu hỗ trợ">
          <SectionHeading
            icon="mail"
            tone="accent"
            title="Gửi lời nhắn hoặc góp ý cho Lingo"
            description="Mọi phản hồi của bạn đều giúp Lingo hoàn thiện hơn mỗi ngày"
            className="mb-4"
          />
          <Card>
            {submitted ? (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-good/15 text-good">
                    <Icon name="check" size={22} />
                  </span>
                  <div>
                    <h3 className="font-semibold">
                      Đã gửi góp ý trực tiếp tới đội ngũ Lingo!
                    </h3>
                    <p className="text-xs text-muted">
                      Chủ đề: <strong>{topic}</strong>
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-muted">
                  Cảm ơn bạn đã đóng góp ý kiến để giúp Lingo hoàn thiện hơn.
                  Đội ngũ sẽ xem xét và phản hồi sớm nhất qua email bạn đã để
                  lại (nếu có).
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                  >
                    Gửi thêm góp ý khác
                  </Button>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary hover:underline"
                  >
                    <Icon name="mail" size={14} />
                    Mở ứng dụng Email dự phòng
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Tên của bạn
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={user?.displayName ?? "Nguyễn Văn A"}
                      className="field mt-1.5"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Email nhận phản hồi (không bắt buộc)
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={user?.email ?? "ban@example.com"}
                      className="field mt-1.5"
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  Vấn đề bạn cần hỗ trợ
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="field mt-1.5"
                  >
                    {TOPIC_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Chi tiết yêu cầu hoặc góp ý
                  <textarea
                    required
                    minLength={5}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả rõ trang bạn đang dùng, từ vựng/video cần kiểm tra hoặc ý tưởng bạn muốn đóng góp…"
                    className="field mt-1.5"
                  />
                </label>
                {submitError && <ErrorNote>{submitError}</ErrorNote>}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <a
                    href={mailtoHref}
                    className="text-xs text-muted hover:text-primary hover:underline"
                  >
                    Hoặc gửi qua {SUPPORT_EMAIL}
                  </a>
                  <Button
                    type="submit"
                    disabled={submitting || message.trim().length < 5}
                  >
                    <Icon name="mail" size={16} />
                    {submitting ? "Đang gửi…" : "Gửi góp ý ngay"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </section>

        <section aria-label="Hướng dẫn khắc phục sự cố">
          <SectionHeading
            icon="check"
            tone="good"
            title="Xử lý nhanh các tình huống thường gặp"
            description="Cách tự khắc phục ngay trong vài giây"
            className="mb-4"
          />
          <div className="space-y-3">
            {TROUBLESHOOTING.map((item) => (
              <details
                key={item.question}
                open
                className="panel group overflow-hidden"
              >
                <summary className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <span className="flex-1">{item.question}</span>
                  <Icon
                    name="chevron"
                    size={15}
                    className="text-muted transition-transform group-open:rotate-90"
                  />
                </summary>
                <ul className="space-y-2 border-t border-border bg-surface-2/40 px-5 py-3.5 text-xs leading-6 text-muted">
                  {item.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold text-primary">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
