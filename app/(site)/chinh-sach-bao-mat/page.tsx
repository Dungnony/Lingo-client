import Link from "next/link";
import { Icon } from "@/components/icon";
import { Card, PageHeading } from "@/components/ui";

export const metadata = {
  title: "Chính sách bảo mật · Lingo",
  description:
    "Cách Lingo thu thập, sử dụng và bảo vệ thông tin tài khoản và tiến độ học tập của bạn.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="page-wrap max-w-3xl! space-y-6">
      <PageHeading
        icon="lock"
        tone="primary"
        eyebrow="Minh bạch & Bảo mật"
        title="Chính sách bảo mật"
        description="Lingo tôn trọng quyền riêng tư của bạn và chỉ lưu trữ những thông tin cần thiết để đồng bộ việc học tiếng Anh."
      />

      <Card className="space-y-5 text-sm leading-7 text-muted">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            1. Thông tin Lingo thu thập
          </h2>
          <p>
            Khi bạn đăng ký tài khoản hoặc đăng nhập bằng Google, Lingo chỉ lưu
            các thông tin cơ bản gồm: địa chỉ email, tên hiển thị, ảnh đại diện
            (nếu có), múi giờ học tập và dữ liệu tiến độ học từ vựng, ngữ pháp,
            lịch sử làm bài của bạn.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            2. Mục đích sử dụng thông tin
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Xác thực đăng nhập an toàn qua cookie HttpOnly và duy trì phiên
              làm việc.
            </li>
            <li>
              Đồng bộ tiến độ học tập, chuỗi ngày học (streak), sổ tay từ vựng
              và kết quả luyện tập trên nhiều thiết bị.
            </li>
            <li>
              Gửi email xác minh tài khoản, đặt lại mật khẩu hoặc tổng kết tuần
              học khi bạn chủ động bật tính năng này.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            3. Quyền kiểm soát &amp; Xoá tài khoản
          </h2>
          <p>
            Lingo không bán hay chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba.
            Bạn có thể tự xoá vĩnh viễn tài khoản cùng toàn bộ dữ liệu học tập
            bất cứ lúc nào trong trang{" "}
            <Link href="/account" className="font-semibold text-primary underline">
              Tài khoản
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">
            4. Liên hệ về bảo mật
          </h2>
          <p>
            Nếu có câu hỏi về quyền riêng tư hoặc dữ liệu, vui lòng liên hệ qua{" "}
            <Link href="/ho-tro" className="font-semibold text-primary underline">
              Trung tâm hỗ trợ
            </Link>{" "}
            hoặc email{" "}
            <a
              href="mailto:nguyendungsenpai109@gmail.com"
              className="font-semibold text-primary underline"
            >
              nguyendungsenpai109@gmail.com
            </a>
            .
          </p>
        </section>

        <div className="border-t border-border pt-4 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <Icon name="back" size={14} /> Quay lại trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
}
