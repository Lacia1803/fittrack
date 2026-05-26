# 🏋️ FitTrack - Hệ Thống Theo Dõi Tập Luyện & Dinh Dưỡng Tích Hợp AI

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-43b47f?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker)
![PWA](https://img.shields.io/badge/PWA-Supported-5a0fc8?logo=pwa)

**FitTrack** là một nền tảng All-in-One quản lý thể chất toàn diện dành cho người tập thể hình. Đồ án xuất sắc được thiết kế đáp ứng 100% tiêu chí môn học "Các công nghệ mới trong phát triển phần mềm".

---

## 🚀 Tính Năng Nổi Bật (Features)

- **📝 Ghi chép Hiệp tập Chi tiết (Per-Set Logging):** Lưu trữ chính xác số Reps và Kg cho từng hiệp đơn lẻ sử dụng JSON Serialization linh hoạt.
- **⏱️ Đồng hồ Đếm ngược (Rest Timer):** Tích hợp Web Audio API phát âm thanh "Tíc-Bíp" chuyên nghiệp khi hết giờ nghỉ.
- **📊 Biểu đồ Phân tích (Volume Charts):** Đồ thị Progressive Overload sử dụng thư viện Recharts trực quan, siêu mượt.
- **🍏 Quản lý Dinh dưỡng (Macros & TDEE):** Tự động tính BMR theo công thức y khoa Mifflin-St Jeor và phân bổ Đạm, Tinh bột, Béo theo mục tiêu (Cut/Bulk).
- **🤖 Trợ lý AI Cá nhân (AI Coach):** Tự động nạp ngữ cảnh sinh học (BMI, chiều cao, khối lượng tạ) vào hệ thống LLM để tư vấn lộ trình tập chính xác.
- **📱 Trải nghiệm Di động (PWA & Offline Sync):** Hỗ trợ cài đặt trực tiếp lên màn hình chính, lưu trữ ngoại tuyến, tự động đồng bộ ngầm khi có mạng.
- **🌗 Giao diện Động (Dynamic Theme):** Thay đổi chế độ Sáng/Tối lập tức qua kỹ thuật ánh xạ CSS Variables trên engine của Tailwind v4.
- **🖨️ Xuất Báo Cáo PDF:** Tổng hợp toàn bộ hồ sơ và lịch sử tập luyện thành báo cáo A4, định dạng tối ưu máy in (`@media print`).
- **📸 Chia sẻ MXH (Social Card):** Vẽ thẻ thành tích sắc nét bằng HTML5 Canvas có định dạng dấu chấm ngăn cách số nghìn tiếng Việt chuẩn.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** Next.js 16 (App Router, Server Components), React 19, Tailwind CSS v4, Lucide React, Recharts.
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Storage, RLS Policies).
- **DevOps:** Docker, Docker Compose đa giai đoạn (Multi-stage build).
- **Kiến trúc:** TypeScript, Web Audio API, PWA Service Workers, JSON Serialization.

## ⚙️ Cài đặt & Khởi chạy (Quick Start)

### Yêu cầu hệ thống:

- Node.js 18+ (Dành cho môi trường Dev)
- Docker & Docker Compose (Dành cho môi trường Production)
- Tài khoản Supabase (Lấy URL và Anon Key)

### Cài đặt môi trường Lập trình (Dev):

1. Clone dự án về máy.
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường: Sao chép file mẫu và điền giá trị thực tế:

   ```bash
   cp .env.example .env.local
   # rồi mở .env.local và gán giá trị thực tế (Supabase, Gemini, ...)
   ```

   Ví dụ các biến cần điền (xem thêm `.env.example`):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GEMINI_API_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   Lưu ý: Tuyệt đối không commit file `.env.local` chứa secrets lên GitHub. Thay vào đó, dùng `.env.example` làm mẫu và cấu hình biến môi trường trên VPS/host.

4. Khởi chạy máy chủ cục bộ:
   ```bash
   npm run dev
   ```

### 🐳 Chạy Production bằng Docker:

Chỉ cần chạy lệnh sau, hệ thống sẽ tự động nạp file `.env.local` vào container và build image tối ưu:

```bash
docker compose up -d --build
```

Truy cập ứng dụng hoàn chỉnh tại `http://localhost:3000`.

## 📂 Cấu Trúc Báo Cáo Đính Kèm

Dự án cung cấp sẵn tài liệu báo cáo để nộp cho Hội đồng bảo vệ:

- 📄 `/BAO_CAO_TOAN_VAN.md`: Toàn văn luận văn đồ án cuối kỳ (Rất dài và học thuật).
- 🤖 `/DOCS-BAO-CAO-AI.md`: Bảng phụ lục các prompts AI đã thực hiện.
- 📋 `/QUY-CHE-THI-CUOI-KY.txt`: Chuẩn đầu ra yêu cầu.

## 🔒 Bảo mật (Security)

Toàn bộ dữ liệu được bảo vệ nghiêm ngặt bằng cơ chế **Row Level Security (RLS)** ngay tại tầng Database Engine (PostgreSQL). Không một user nào có thể can thiệp (CRUD) vào dữ liệu của user khác qua API. Phiên đăng nhập (Session) được mã hóa bằng chuẩn HTTPOnly Cookies thông qua Next.js Server Middleware.

---

_Developed as a Final Project Submission._

---

## Tóm tắt hành trình Deploy FitTrack với Domain + SSL

## 🎯 Mục tiêu

Deploy ứng dụng FitTrack lên VPS với Domain + SSL (HTTPS)

---

## 📋 Các bước đã thực hiện

### 1. Tạo Domain miễn phí với DuckDNS

- Đăng ký tại duckdns.org
- Tạo subdomain: `healfittrack.duckdns.org`
- Trỏ về IP VPS: `54.254.195.231`

### 2. Cài Nginx làm Reverse Proxy

- Cài Nginx trên VPS
- Cấu hình proxy từ domain → `localhost:3000` (Docker app)
- Mở port 80, 443 trên Security Group / Firewall

### 3. Lấy SSL Certificate (Let's Encrypt)

- Thử Certbot HTTP challenge → **thất bại** do DuckDNS DNS timeout
- Thử Cloudflare → **thất bại** vì subdomain không đổi được nameserver
- Dùng **DNS challenge với plugin certbot-dns-duckdns** → **✅ thành công**

### 4. Cấu hình Nginx với HTTPS

- Gắn certificate vào Nginx
- Redirect HTTP → HTTPS tự động

---

## ✅ Kết quả cuối cùng

|                |                                    |
| -------------- | ---------------------------------- |
| **URL**        | `https://healfittrack.duckdns.org` |
| **VPS**        | VPS (ví dụ: AWS/Oracle/EC2)        |
| **SSL**        | Let's Encrypt 🔒                   |
| **Auto-renew** | ✅ Tự động renew 90 ngày           |
| **Chi phí**    | **$0 hoàn toàn miễn phí**          |

---

## 💡 Bài học rút ra

- DuckDNS không hỗ trợ HTTP challenge → phải dùng **DNS challenge**
- Cloudflare không hoạt động với subdomain miễn phí trong một số trường hợp
- Plugin `certbot-dns-duckdns` là giải pháp phù hợp nhất cho trường hợp này
