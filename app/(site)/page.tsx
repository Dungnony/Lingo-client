"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import { LevelCoverflow } from "@/components/level-coverflow";
import { LearningJourney } from "@/components/learning-journey";
import { LinkButton } from "@/components/ui";
import { StudyArtwork } from "@/components/study-artwork";
import { useAuth } from "@/lib/auth";
import { useLevels } from "@/lib/hooks";

// Nội dung giới thiệu tính năng; số liệu học liệu luôn lấy từ API.
const SKILLS: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  sampleEn: string;
  sampleNote: string;
  tag: string;
}[] = [
  {
    href: "/vocabulary",
    icon: "book",
    title: "Từ vựng chuẩn CEFR",
    description: "Phiên âm IPA, giọng đọc, nghĩa tiếng Việt và ví dụ thực tế",
    sampleEn: "fluent · /ˈfluː.ənt/",
    sampleNote: "Trôi chảy, lưu loát",
    tag: "Từ vựng",
  },
  {
    href: "/grammar",
    icon: "cards",
    title: "Ngữ pháp & bài tập điền từ",
    description: "Giải thích dễ hiểu kèm bài luyện chọn từ điền câu ngay tại chỗ",
    sampleEn: "She has lived here since 2020.",
    sampleNote: "Present Perfect · Hiện tại hoàn thành",
    tag: "Ngữ pháp",
  },
  {
    href: "/watch",
    icon: "play",
    title: "Học qua video song ngữ",
    description: "Phụ đề chạy khớp lời nói, bấm vào bất kỳ từ nào để tra nhanh",
    sampleEn: "Stay hungry. Stay foolish.",
    sampleNote: "TED Talks & hội thoại hàng ngày",
    tag: "Video song ngữ",
  },
  {
    href: "/pronunciation",
    icon: "mic",
    title: "Luyện nghe & phát âm",
    description: "Nghe câu mẫu, thu âm giọng đọc và nhận chấm điểm từng từ",
    sampleEn: "Practice makes progress.",
    sampleNote: "Nhận diện giọng nói trực tiếp",
    tag: "Nghe & Nói",
  },
];
const FAQ = [
  [
    "Mới bắt đầu học tiếng Anh, mình nên học từ đâu?",
    "Bạn có thể bắt đầu với cấp Beginner. Làm quen với từ vựng cơ bản, nghe phát âm rồi dùng flashcard để ôn lại những từ đã học.",
  ],
  [
    "Lingo giúp mình ghi nhớ từ vựng như thế nào?",
    "Sau mỗi thẻ, bạn đánh giá mức độ ghi nhớ. Lịch ôn được điều chỉnh để bạn gặp lại từ vựng đúng lúc. Bạn có thể chọn cách ôn và số từ mới mỗi ngày trong cài đặt.",
  ],
  [
    "Mình có thể chọn cấp độ phù hợp không?",
    "Có. Lộ trình và thư viện từ vựng có bộ lọc cấp độ. Chọn cấp phù hợp với kiến thức hiện tại, sau đó theo dõi những từ đang học và đã thuộc trong trang tiến độ.",
  ],
  [
    "Có cần biết tiếng Anh trước khi dùng Lingo không?",
    "Không cần. Giao diện được viết bằng tiếng Việt, mỗi từ có nghĩa tiếng Việt và phiên âm IPA, và lộ trình bắt đầu từ cấp Beginner với những từ thông dụng nhất.",
  ],
  [
    "Mình có thể luyện tập trên điện thoại không?",
    "Có. Bạn có thể mở Lingo bằng trình duyệt trên điện thoại, dùng flashcard, nghe âm thanh và tiếp tục học với cùng tài khoản. Tính năng ghi âm cần quyền truy cập micro của trình duyệt.",
  ],
  [
    "Tiến độ học có được lưu lại không?",
    "Các lượt ôn đã gửi thành công được lưu vào tài khoản. Trang tổng quan, tiến độ và huy hiệu sẽ giúp bạn theo dõi hành trình học. Phần ghi âm luyện nói dùng để nghe lại trên thiết bị trong buổi luyện hiện tại.",
  ],
];

export default function Home() {
  const { user } = useAuth();
  const levels = useLevels();
  const totalWords = levels.data?.reduce(
    (sum, level) => sum + level.wordsInDb,
    0,
  );
  return (
    <div>
      <section className="home-hero overflow-hidden border-b border-border">
        <div className="page-wrap relative grid items-center gap-4 py-10! md:grid-cols-[1.05fr_1fr] md:py-12!">
          <div className="reveal-group relative z-10 max-w-xl">
            <span className="section-label">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> MỖI NGÀY
              MỘT CHÚT TIẾNG ANH
            </span>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[56px]">
              Học thêm mỗi ngày.
              <br />
              <span className="text-primary">Tự tin thêm một chút.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted sm:text-base">
              Từ những lời chào đầu tiên đến hành trình chinh phục tiếng Anh. Lingo
              cùng bạn học, luyện tập và nhìn thấy mình tiến bộ.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton
                href={user ? "/learn" : "/onboarding"}
                className="px-6!"
              >
                {user ? "Tiếp tục hành trình" : "Bắt đầu học ngay"}
                <Icon name="arrow" size={17} />
              </LinkButton>
              <LinkButton href="#lo-trinh" variant="secondary">
                Khám phá lộ trình
              </LinkButton>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted">
              <Icon name="check" size={15} className="text-good" /> Học theo
              nhịp của bạn · Lưu từng bước tiến
            </p>
            <ul className="reveal mt-6 flex flex-wrap gap-2.5">
              {[
                {
                  n: totalWords ? totalWords.toLocaleString("vi-VN") : "—",
                  t: "từ vựng kèm phát âm",
                },
                { n: "6 cấp", t: "Beginner → Advanced" },
                { n: "Video", t: "phụ đề song ngữ chạy đồng bộ" },
              ].map((f) => (
                <li
                  key={f.t}
                  className="rounded-xl border border-primary/15 bg-surface/70 px-3 py-2 backdrop-blur"
                >
                  <span className="block text-sm font-bold text-primary">
                    {f.n}
                  </span>
                  <span className="block text-[11px] text-muted">{f.t}</span>
                </li>
              ))}
            </ul>
          </div>
          <StudyArtwork />
        </div>
      </section>
      <div className="page-wrap space-y-10 py-8! sm:space-y-12 sm:py-10!">
        <section
          id="cach-hoc"
          className="grid scroll-mt-24 gap-6 lg:grid-cols-[1.55fr_1fr]"
        >
          <div>
            <SectionHeading
              icon="spark"
              title="Một góc học, nhiều cách khám phá"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/learn",
                  icon: "route" as const,
                  title: "Học theo lộ trình bài bản",
                  text: "Chia nhỏ theo từng chủ đề từ A1 đến C2, học tới đâu chắc tới đó.",
                  className: "discovery-red",
                  label: "BẮT ĐẦU TỪ ĐÂY",
                  sampleEn: "Level 1 → Level 6",
                  sampleSub: "650+ bài học theo chủ đề giao tiếp & học thuật",
                },
                {
                  href: "/study",
                  icon: "cards" as const,
                  title: "Ôn tập Flashcard thông minh",
                  text: "Thuật toán SM-2 & FSRS tự tính thời điểm vàng để nhắc bạn ôn lại trước khi quên.",
                  className: "discovery-gold",
                  label: "GHI NHỚ LÂU DÀI",
                  sampleEn: "Spaced Repetition",
                  sampleSub: "Chỉ 10–15 phút mỗi ngày để giữ vững vốn từ",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`reveal hover-card discovery-card ${item.className}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-widest">
                      {item.label}
                    </span>
                    <Icon name={item.icon} size={19} />
                  </div>
                  <div className="my-5 rounded-xl border border-primary/15 bg-surface/80 px-3.5 py-3 backdrop-blur-sm">
                    <p
                      lang="en"
                      className="word-display text-lg font-bold text-primary"
                    >
                      {item.sampleEn}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.sampleSub}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1.5 text-xs opacity-80">{item.text}</p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-foreground">
                      <Icon name="arrow" size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading icon="book" title="Kho học liệu của bạn" />
            <div className="reveal panel mt-4 overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-border">
                {[
                  {
                    icon: "book" as const,
                    value:
                      totalWords === undefined
                        ? "—"
                        : totalWords.toLocaleString("vi-VN"),
                    label: "Từ vựng trong thư viện",
                  },
                  {
                    icon: "route" as const,
                    value: levels.data ? String(levels.data.length) : "—",
                    label: "Cấp độ đang có",
                  },
                  {
                    icon: "cards" as const,
                    value: "Flashcard",
                    label: "Ôn theo mức độ ghi nhớ",
                  },
                  {
                    icon: "chart" as const,
                    value: "Tiến độ",
                    label: "Theo dõi từng cấp độ",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 bg-surface px-4 py-5"
                  >
                    <span className="mt-1 text-primary">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <div>
                      <p className="text-lg font-bold tracking-tight">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {levels.error && (
                <p className="px-4 pt-3 text-xs text-muted">
                  Chưa tải được số liệu.{" "}
                  <button
                    className="text-primary underline underline-offset-2"
                    onClick={() => void levels.mutate()}
                  >
                    Tải lại
                  </button>
                </p>
              )}
              <Link
                href="/vocabulary"
                className="flex items-center justify-between px-4 py-3.5 text-xs font-medium text-muted transition-colors hover:bg-primary/5 hover:text-primary"
              >
                Khám phá thư viện từ vựng
                <Icon name="arrow" size={15} />
              </Link>
            </div>
          </div>
        </section>
        <section>
          <SectionHeading
            icon="target"
            title="Hôm nay, bạn muốn luyện gì?"
            href="/dashboard"
            label="Góc học tập"
          />
          <div className="reveal-group mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((skill) => (
              <Link
                key={skill.href}
                href={skill.href}
                className="hover-card skill-card panel group overflow-hidden"
              >
                <div className="relative flex h-28 flex-col justify-center overflow-hidden bg-primary/4 px-4 pt-5">
                  <span className="absolute left-3 top-2.5 rounded-md border border-primary/10 bg-surface px-2 py-0.5 text-[10px] font-medium text-primary">
                    {skill.tag}
                  </span>
                  <p
                    lang="en"
                    className="word-display mt-2 truncate text-sm font-bold text-foreground group-hover:text-primary"
                  >
                    {skill.sampleEn}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {skill.sampleNote}
                  </p>
                  <span className="absolute bottom-2.5 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-fg">
                    <Icon name={skill.icon} size={15} />
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold group-hover:text-primary">
                    {skill.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted">
                    {skill.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section id="lo-trinh" className="scroll-mt-24">
          <div className="reveal">
            <span className="section-label">LỘ TRÌNH HỌC</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Từ bước đầu đến những điều xa hơn
            </h2>
            <p className="mt-2 text-sm text-muted">
              Chọn điểm xuất phát. Học từng bài. Tiến bộ theo cách của bạn.
            </p>
          </div>

          <div className="mt-6">
            <LearningJourney />
          </div>

          <p className="reveal mt-9 text-sm font-semibold text-muted">
            Sáu cấp độ — chọn nơi bạn muốn bắt đầu:
          </p>
          <div className="reveal mt-2">
            <LevelCoverflow
              wordCounts={
                levels.data
                  ? new Map(levels.data.map((l) => [l.level, l.wordsInDb]))
                  : undefined
              }
            />
          </div>
        </section>
      </div>
      <section className="border-y border-border bg-surface">
        <div className="page-wrap grid items-center gap-8 py-10! md:grid-cols-[1fr_auto]">
          <div className="reveal">
            <span className="section-label">
              <Icon name="flame" size={14} /> THÓI QUEN NHỎ, HÀNH TRÌNH DÀI
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Dành một chút thời gian cho chính mình.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              Một bài học trên máy tính, vài từ mới trên điện thoại. Đăng nhập
              cùng tài khoản để tiếp tục hành trình ở nơi bạn thấy thoải mái
              nhất.
            </p>
            <LinkButton
              href={user ? "/settings" : "/onboarding"}
              className="mt-5"
            >
              {user ? "Đặt mục tiêu mỗi ngày" : "Tạo góc học của bạn"}
              <Icon name="arrow" size={16} />
            </LinkButton>
          </div>
          <div
            aria-hidden="true"
            className="reveal habit-illustration hidden md:flex"
          >
            <div className="habit-orbit" />
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/8 text-primary">
              <Icon name="flame" size={48} />
            </div>
            <span className="absolute bottom-5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium shadow-sm">
              Hôm nay, cùng tiến thêm một bước.
            </span>
          </div>
        </div>
      </section>
      <section
        id="cau-hoi"
        className="page-wrap max-w-3xl! scroll-mt-24 py-12! sm:py-16!"
      >
        <div className="reveal text-center">
          <span className="section-label">HỎI & ĐÁP</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Bạn hỏi, <span className="text-primary">Lingo trả lời.</span>
          </h2>
          <p className="mt-3 text-sm text-muted">
            Một vài điều trước khi bắt đầu hành trình tiếng Anh.
          </p>
        </div>
        <div className="mt-7 space-y-3">
          {FAQ.map(([question, answer]) => (
            <details key={question} className="reveal faq-item panel group">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 text-sm font-medium">
                {question}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                  <Icon
                    name="plus"
                    size={13}
                    className="transition-transform group-open:rotate-45"
                  />
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-7 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        id="ho-tro"
        className="border-t border-border bg-surface/60 scroll-mt-24"
      >
        <div className="page-wrap space-y-6 py-12! sm:py-14!">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-label">
                <Icon name="mail" size={13} /> LIÊN HỆ &amp; HỖ TRỢ HỌC VIÊN
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Cần giải đáp hoặc góp ý?{" "}
                <span className="text-primary">Lingo luôn lắng nghe.</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Đội ngũ phát triển luôn sẵn sàng hỗ trợ bạn về tài khoản, lộ
                trình học, báo lỗi từ vựng hoặc tiếp nhận ý tưởng tính năng mới.
              </p>
            </div>
            <LinkButton href="/ho-tro">
              Trung tâm hỗ trợ &amp; Gửi góp ý
              <Icon name="arrow" size={16} />
            </LinkButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-5">
              <span className="icon-tile mb-3">
                <Icon name="mail" size={19} />
              </span>
              <h3 className="text-sm font-semibold">Email hỗ trợ trực tiếp</h3>
              <p className="mt-1.5 text-xs leading-6 text-muted">
                Hỗ trợ khôi phục tài khoản, giải đáp kỹ thuật và tiếp nhận góp ý
                trực tiếp qua hộp thư đội ngũ Lingo.
              </p>
              <a
                href="mailto:nguyendungsenpai109@gmail.com?subject=%5BLingo%5D%20Y%C3%AAu%20c%E1%BA%A7u%20h%E1%BB%97%20tr%E1%BB%A3"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                nguyendungsenpai109@gmail.com
                <Icon name="arrow" size={14} />
              </a>
            </div>

            <div className="panel p-5">
              <span className="icon-tile mb-3">
                <Icon name="flag" size={19} />
              </span>
              <h3 className="text-sm font-semibold">
                Góp ý từ vựng &amp; học liệu
              </h3>
              <p className="mt-1.5 text-xs leading-6 text-muted">
                Phát hiện nghĩa tiếng Việt hoặc ví dụ chưa chuẩn? Bấm nút 🚩 trên
                thẻ từ hoặc gửi biểu mẫu tại trang Hỗ trợ.
              </p>
              <Link
                href="/ho-tro"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Gửi phản hồi nội dung
                <Icon name="arrow" size={14} />
              </Link>
            </div>

            <div className="panel p-5">
              <span className="icon-tile mb-3">
                <Icon name="message" size={19} />
              </span>
              <h3 className="text-sm font-semibold">
                Cộng đồng &amp; Trợ lý AI 24/7
              </h3>
              <p className="mt-1.5 text-xs leading-6 text-muted">
                Hỏi bài tức thì cùng Trợ lý AI ở góc phải màn hình hoặc kết nối,
                nhắn tin luyện tiếng Anh cùng bạn học khác.
              </p>
              <Link
                href={user ? "/messages?tab=connect" : "/ho-tro"}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                {user ? "Kết nối bạn học ngay" : "Xem hướng dẫn chi tiết"}
                <Icon name="arrow" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
function SectionHeading({
  icon,
  title,
  href,
  label,
}: {
  icon: IconName;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold sm:text-base">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon name={icon} size={15} />
        </span>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          {label}
          <Icon name="arrow" size={14} />
        </Link>
      )}
    </div>
  );
}
