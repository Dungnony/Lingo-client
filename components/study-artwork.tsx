import { Icon } from "./icon";

/**
 * Minh hoạ trực quan không gian học tiếng Anh của Lingo trên trang chủ:
 * Thẻ từ vựng kèm IPA, câu ví dụ song ngữ, chuỗi ngày học và phụ đề video.
 */
export function StudyArtwork() {
  return (
    <div
      className="reveal relative mx-auto w-full max-w-lg py-2"
      aria-hidden="true"
    >
      {/* Huy hiệu chuỗi ngày học nổi góc trên */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
          <Icon name="flame" size={15} />
          Chuỗi 14 ngày học liên tục
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-good/25 bg-good/10 px-3 py-1 text-[11px] font-semibold text-good">
          <Icon name="check" size={13} />
          Mục tiêu hôm nay: 20/20 từ
        </span>
      </div>

      {/* Thẻ Flashcard tiếng Anh chính */}
      <div className="panel relative overflow-hidden p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Level 5 · Upper-Intermediate
              </span>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">
                noun
              </span>
            </div>
            <p
              lang="en"
              className="word-display mt-2.5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              resilience
            </p>
            <p className="mt-1 font-mono text-sm text-primary">
              /rɪˈzɪl.jəns/
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-sm">
            <Icon name="sound" size={19} />
          </span>
        </div>

        <div className="mt-4 border-t border-border pt-3.5">
          <p className="text-base font-semibold text-foreground">
            Sự kiên cường, khả năng phục hồi sau khó khăn
          </p>
          <div className="mt-2.5 rounded-xl bg-surface-2/80 px-3.5 py-2.5 text-xs leading-relaxed">
            <p lang="en" className="font-medium text-foreground">
              &ldquo;Building <span className="text-primary underline decoration-primary/40 underline-offset-4">resilience</span> takes daily practice and patience.&rdquo;
            </p>
            <p className="mt-0.5 text-muted">
              Rèn luyện sự kiên cường cần sự thực hành và kiên nhẫn mỗi ngày.
            </p>
          </div>
        </div>

        {/* 4 mức đánh giá SRS */}
        <div className="mt-4 grid grid-cols-4 gap-2 pt-1 text-center text-[11px] font-semibold">
          <div className="rounded-lg border border-danger/25 bg-danger/8 py-2 text-danger">
            Quên · 1p
          </div>
          <div className="rounded-lg border border-warn/25 bg-warn/8 py-2 text-warn">
            Khó · 1ng
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/10 py-2 text-primary">
            Nhớ · 4ng
          </div>
          <div className="rounded-lg border border-good/25 bg-good/10 py-2 text-good">
            Rất dễ · 9ng
          </div>
        </div>
      </div>

      {/* Thẻ phụ đề video song ngữ & tra từ nhanh bên dưới */}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <div className="panel flex items-start gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-good/12 text-good">
            <Icon name="play" size={17} />
          </span>
          <div className="min-w-0 text-xs">
            <p className="font-semibold text-foreground">
              Phụ đề video song ngữ
            </p>
            <p lang="en" className="mt-0.5 truncate text-muted">
              &ldquo;Stay hungry. Stay foolish.&rdquo;
            </p>
            <p className="text-[11px] text-good">
              Bấm trực tiếp vào từ trong câu để tra nghĩa
            </p>
          </div>
        </div>

        <div className="panel flex items-start gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <Icon name="spark" size={17} />
          </span>
          <div className="min-w-0 text-xs">
            <p className="font-semibold text-foreground">
              Trợ lý AI &amp; Luyện nói
            </p>
            <p className="mt-0.5 text-muted">
              Giải thích ngữ pháp, chấm phát âm &amp; điền từ trực tiếp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
