# Giao diện Lingo

Giao diện **Lingo — học tiếng Anh** (6 cấp độ, 1 Beginner → 6 Advanced), tham khảo bố cục [Hanbeego](https://hanbeego.com/). Tông xanh dương (`--primary` `#2563eb`, dark `#60a5fa`), trắng và xám nhạt; hỗ trợ giao diện tối và điện thoại. Không dùng mock data.

## Màn hình và dữ liệu

| Đường dẫn | Chức năng | Dữ liệu |
| --- | --- | --- |
| `/` | Giới thiệu, băng chuyền 6 cấp độ, kỹ năng, hỏi đáp | Số từ mỗi cấp từ `/levels`; nội dung giới thiệu là nội dung tĩnh |
| `/onboarding` | Khảo sát 3 bước, đề xuất cấp độ bắt đầu | `/onboarding` (làm được trước khi có tài khoản) |
| `/dashboard` | Tổng quan, mục tiêu, chuỗi ngày, lối tắt luyện tập, từ vựng hôm nay, kệ video | Study stats, streak, learn path, onboarding, `/words/of-the-day` |
| `/learn?level=…` | Lộ trình theo cấp, bài học theo chủ đề | `/learn/path` |
| `/learn/[lessonId]` | Từ vựng (IPA, từ loại, nghe), ví dụ, ẩn nghĩa; bắt đầu học | `/learn/lessons/:id` |
| `/study?lesson=…`, `/study?notebook=1` | Flashcard và kiểm tra cuối buổi; `notebook=1` chỉ ôn từ đã lưu trong sổ tay | Study session, queue (`notebook=true`), review và quiz |
| `/vocabulary` | Tìm theo từ hoặc nghĩa, lọc cấp độ, nghe từ, lưu ♥ vào sổ tay | `/words`, `/notebook/ids` |
| `/notebook` | Sổ tay: tab "Đã lưu" (♥) và "Hay sai" (quên ≥ 2 lần), ôn bằng flashcard, kiểm tra nhanh các từ trong trang | `/notebook`, `/quiz/generate`, `/quiz/submit` |
| `/grammar` | 72 điểm ngữ pháp, cấu trúc, ví dụ có nghe + ẩn/hiện bản dịch | `/grammar/levels`, `/grammar`, `/grammar/:slug` |
| `/listening` | Nghe từ rồi gõ lại, đối chiếu và gợi ý phiên âm | `/words`, `/practice/attempts` |
| `/pronunciation` | Nghe mẫu, ghi âm tối đa 45 giây, nghe lại; chấm phát âm 0–100 (đạt ≥ 80) trên Chrome/Edge | `/words`, `/practice/attempts`; micro trên thiết bị |
| `/admin` | Quản trị nội dung (chỉ role `admin`): sửa từ, soạn ngữ pháp, sửa/xoá video | `/admin/words`, `/admin/grammar`, `/admin/videos`, `DELETE /videos/:id` |
| `/writing` | Chính tả: nghe câu ví dụ rồi gõ lại, tô đỏ từ sai | `/words?withExamples=true`, `/practice/attempts` |
| `/exams` | Kiểm tra trình độ 5 hoặc 10 câu, nghe + đọc, tính giờ | `/levels`, `/words`, `/quiz/generate`, `/quiz/submit`, `/exams/attempts` |
| `/exams/results` | Điểm và xem lại đáp án | Kết quả đã nộp, giữ trong `sessionStorage` theo tài khoản và lượt làm |
| `/watch`, `/watch/[id]`, `/watch/add` | Học qua video YouTube, bản chép tiếng Anh chạy đồng bộ + bản dịch | `/videos` |
| `/minigame`, `/leaderboard` | Minigame, đấu 1v1, bảng xếp hạng | `/minigame`, `/duel`, `/leaderboard` |
| `/messages`, `/u/[id]` | Tin nhắn (dịch tin nhắn tiếng Anh), hồ sơ công khai | `/messages`, `/users` |
| `/progress`, `/achievements` | Tiến độ theo cấp độ và huy hiệu | Progress overview, achievements |
| `/account`, `/settings` | Hồ sơ, bảo mật, ví xu, mục tiêu, cách ôn, múi giờ, thông báo | User và settings |

Mọi yêu cầu API dùng `lib/api.ts`, cookie phiên và cơ chế refresh token có sẵn. Lựa chọn bài/cấp độ được giữ qua `next` khi đăng nhập hoặc chuyển sang đăng ký; chỉ chấp nhận đường dẫn nội bộ. Đăng xuất dọn cache SWR và kết quả xem lại trên thiết bị.

## Giới hạn hiện tại

- **Âm thanh**: chưa có bản thu. Mọi chỗ phát âm (`AudioButton`, `useWordAudio()`) dùng giọng đọc tiếng Anh của trình duyệt (`en-US` → `en-GB` → `en*`) và báo rõ khi thiết bị không có giọng tiếng Anh.
- **Nội dung do AI sinh**: phiên âm IPA, nghĩa tiếng Việt và câu ví dụ do Gemini sinh, chưa được rà soát tay; trang `/nguon-du-lieu` ghi rõ điều này.
- **Phát âm**: ghi âm và nghe lại trên thiết bị, không gửi bản ghi lên server Lingo. Chuyển từ/trang sẽ dừng micro và giải phóng bản ghi. Ghi âm cần HTTPS hoặc localhost cùng quyền micro.
- **Chấm phát âm**: dùng Web Speech API của trình duyệt (`components/practice/use-speech-check.ts`) — chỉ Chrome/Edge, trình duyệt khác ẩn khối chấm điểm. Âm thanh được **gửi tới máy chủ nhận dạng của Google/Microsoft** (trang có ghi chú). Điểm = độ giống giữa chữ nhận dạng được và từ mẫu (`lib/pronunciation-score.ts`, Levenshtein, lấy phương án tốt nhất trong 5), không phải chấm theo âm vị.
- **Quản trị**: mục "Quản trị nội dung" trên sidebar chỉ hiện với role `admin`, nhưng bảo vệ thật nằm ở server. Cấp quyền bằng `npm run user:set-role -- <email> admin` trong server. `npm run db:seed` ghi đè lại các điểm ngữ pháp có sẵn; `SEED_RESET=true` xoá mọi sửa đổi từ vựng.
- **Kiểm tra**: là quiz từ vựng, không phải đề IELTS/TOEIC. Tạo câu hỏi từ nhóm tối đa 24 từ của cấp đang chọn. Chỉ hoàn tất khi `/quiz/submit` trả điểm hợp lệ; nộp lỗi giữ đáp án để thử lại.
- **Video**: chỉ lấy được bản chép tự động từ video có phụ đề (CC) tiếng Anh; không seed sẵn video nào.

## Thương hiệu và hình ảnh

- Logo: `public/brand/lingo.svg` (chữ L trắng + bóng thoại vàng trên nền xanh), dùng trong `Brand` (header, sidebar) và avatar trợ lý AI.
- Mascot: vẹt xanh "Lingo" ôm sách ABC, vẫy cánh — `public/brand/lingo-mascot.svg` (canvas 1367×1150). Dùng ở màn đăng nhập (SVG trực tiếp, lơ lửng nhẹ, tắt khi `prefers-reduced-motion`) và màn tải (`anhloading.png`).
- Ảnh chia sẻ `public/themes.png` (1672×941): nền `og-background.svg` + mascot, bóng thoại "Hello! /həˈloʊ/", logo, 3 ô tính năng, khẩu hiệu.
- Favicon (`app/favicon.ico`, 16–256px) và icon PWA (`public/icons/`) xuất từ `lingo.svg`; icon maskable/Apple xuất từ `lingo-fullbleed.svg` (nền phủ kín, logo trong vùng an toàn 80%).
- Mọi PNG/ICO sinh bằng `node scripts/build-brand-assets.mjs` (dùng `sharp` có sẵn kèm Next.js). Chữ trong SVG dùng font Segoe UI/Arial của máy xuất ảnh.
- Minh họa sách ở trang chủ dựng bằng CSS trong `components/study-artwork.tsx`; chữ trang trí ("ENG", "A", "Hello") không phải học liệu.
- Ký tự lớn trang trí (dashboard, màn đăng nhập, 404) dùng chữ Latin ("Aa", "S+V", "/ə/"…) với class `word-display`.

## Trang đăng nhập với video thương hiệu

Trang `/login` tham khảo bố cục [đăng nhập Hanbeego](https://hanbeego.com/login): thẻ biểu mẫu phía trái, phần minh họa trên nền xanh phía phải (`--login-story-base`/`--login-story-glow` trong `app/globals.css`, có bản dark). Điện thoại xếp biểu mẫu trước, video sau.

- `components/login-shell.tsx`: header với logo, nút sáng/tối, mascot `lingo-mascot.svg` (class `login-mascot`), câu châm ngôn tiếng Anh và footer quay về trang chủ.
- `app/login/page.tsx`: hiện/ẩn mật khẩu, quên mật khẩu, đăng ký giữ tham số `next`. Google chỉ xuất hiện khi đã có cấu hình.
- Kiểu dáng giới hạn trong các lớp `login-*` của `app/globals.css`.

## Hiệu ứng và thành phần chung

- `app/globals.css`: token light/dark, panel, hover, focus, skeleton, minh họa, class `word-display` cho từ/câu tiếng Anh làm tiêu điểm.
- `components/page-motion.tsx` + `app/template.tsx`: mờ hiện trang và reveal nội dung, kể cả dữ liệu nạp sau. Reveal 620ms, dịch 16px, trễ theo nhóm tối đa 320ms.
- Hover 260ms; thẻ nâng 4px, nút nâng 2px. Chỉ áp dụng hover nâng trên thiết bị có con trỏ phù hợp.
- Tôn trọng `prefers-reduced-motion`. Nội dung vẫn hiện khi JavaScript/IntersectionObserver không hỗ trợ và khi in.
- `loading.tsx` trong hai nhóm route dùng skeleton. Có màn 404 và lỗi tải đồng bộ giao diện.
- `components/app-shell.tsx`: sidebar, breadcrumbs, tài khoản; menu mobile dùng dialog gốc, giữ focus và hỗ trợ Escape.
- Âm thanh dừng và micro được giải phóng khi rời nội dung.
