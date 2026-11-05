# Giao diện thư viện học tập Lingo

Áp dụng cho `/vocabulary`, `/grammar` và `/exams`.

## Nguồn tham khảo

- [Duolingo — Reshaping Duo](https://blog.duolingo.com/reshaping-duo/): giữ nhận diện thương hiệu nhất quán khi làm mới giao diện trên nhiều nền tảng.

Thiết kế và mã giao diện được viết riêng cho app. Minh họa thẻ giấy dùng CSS và văn bản, không cần ảnh tải từ bên ngoài. Ô từ vựng (`.wordTile`) cho từ dài xuống dòng.

## Quy tắc đồng bộ

- Dùng `--primary` hiện có của ứng dụng: xanh `#2563eb` ở chế độ sáng, `#60a5fa` ở chế độ tối.
- Nền, chữ và đường viền lấy từ `--surface`, `--background`, `--foreground`, `--muted`, `--border`; các sắc nhạt được pha từ cùng màu chính bằng `color-mix`.
- Dùng chung `LearningHeader`, `LevelFilter`, `LearningTip` và CSS Module `learning-library.module.css`.
- Màu được chọn đi kèm `aria-pressed` / `aria-current`; ngữ pháp có `aria-expanded`, vùng chi tiết và trạng thái rỗng, lỗi, thử lại.
- Từ vựng giữ tìm kiếm qua API và phân trang. Ngữ pháp tìm trong cấp đang chọn, hỗ trợ tiếng Việt không dấu. Thiết lập kiểm tra giữ luồng tạo bài, làm bài và lưu kết quả hiện có.
- Minh họa được ẩn trên điện thoại để ưu tiên nội dung học. Các cột phụ chuyển xuống dưới nội dung ở màn hình nhỏ; tôn trọng tùy chọn giảm chuyển động.
