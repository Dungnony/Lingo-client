import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nguồn dữ liệu — Lingo",
  description:
    "Ghi công các nguồn dữ liệu mở (danh sách từ vựng và cấp độ CEFR) mà Lingo sử dụng, theo đúng giấy phép gốc.",
};

function SourceCard({
  name,
  url,
  license,
  children,
}: {
  name: string;
  url: string;
  license: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {name}
          </a>
        </h2>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
          {license}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{children}</p>
    </div>
  );
}

export default function NguonDuLieuPage() {
  return (
    <div className="page-wrap max-w-3xl! space-y-8 py-12!">
      <section className="reveal text-center">
        <p className="eyebrow">MINH BẠCH VỀ DỮ LIỆU</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Nguồn dữ liệu &amp; ghi công
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
          Danh sách từ vựng và cấp độ của Lingo lấy từ các nguồn mở dưới đây,
          được chia sẻ lại đúng theo giấy phép gốc.
        </p>
      </section>

      <div className="space-y-4">
        <SourceCard
          name="CEFR-J Wordlist 1.5"
          url="https://github.com/openlanguageprofiles/olp-en-cefrj"
          license="Miễn phí, cần trích dẫn"
        >
          Biên soạn bởi Yukio Tono, Tokyo University of Foreign Studies (bản
          quyền: Tono Laboratory, TUFS). Cung cấp danh sách từ, từ loại và cấp
          CEFR A1–B2 — tương ứng Level 1–4 của Lingo.
        </SourceCard>

        <SourceCard
          name="Octanove Vocabulary Profile C1/C2"
          url="https://github.com/openlanguageprofiles/olp-en-cefrj"
          license="CC BY-SA 4.0"
        >
          Tác giả: Octanove Labs. Cung cấp danh sách từ, từ loại và cấp CEFR
          C1–C2 — tương ứng Level 5–6 của Lingo.
        </SourceCard>

        <div className="panel p-6">
          <h2 className="font-semibold">Phiên âm, nghĩa và câu ví dụ</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Phiên âm IPA, nghĩa tiếng Việt, định nghĩa tiếng Anh và câu ví dụ
            được sinh tự động bằng AI (Google Gemini) và chưa được người rà
            soát toàn bộ — vẫn có thể còn sai sót, mọi góp ý đều được hoan
            nghênh.
          </p>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="font-semibold">Bộ dữ liệu phái sinh của Lingo</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Bộ từ vựng tổng hợp (~8.600 từ, 6 cấp) do Lingo ghép từ các nguồn
          trên, được phát hành lại theo đúng giấy phép{" "}
          <strong className="text-foreground">CC BY-SA 4.0</strong> (điều
          khoản share-alike). Mã nguồn ứng dụng Lingo không bị ràng buộc bởi
          giấy phép này.
        </p>
      </div>

      <p className="text-center text-xs leading-6 text-muted">
        Có thắc mắc về nguồn dữ liệu hoặc muốn báo lỗi? Quay lại{" "}
        <Link href="/" className="text-primary hover:underline">
          trang chủ
        </Link>{" "}
        để liên hệ với Lingo.
      </p>
    </div>
  );
}
