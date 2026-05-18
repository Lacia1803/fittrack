# 🤖 PHỤ LỤC MINH CHỨNG SỬ DỤNG AI TOOL TRONG PHÁT TRIỂN PHẦN MỀM
*(Tài liệu đính kèm Báo cáo toàn văn đồ án cuối kỳ môn "Các công nghệ mới trong phát triển phần mềm" - Lớp CTK46-PM)*

Tài liệu này trình bày chi tiết danh sách các prompts cấu trúc cao, lý do áp dụng và kết quả kỹ thuật đạt được khi sử dụng Trợ lý AI làm Co-pilot phát triển hệ thống **FitTrack**.

---

## 📊 TỔNG HỢP DANH SÁCH PROMPTS ĐÃ THỰC HIỆN (>5 PROMPTS)

### 1. Prompt 1: Thiết kế giải pháp lưu trữ Hiệp tập (Per-Set Logging) tương thích Database cũ
* **Ngữ cảnh**: Hệ thống cũ lưu bài tập theo số hiệp phẳng (`sets`, `reps`, `weight_kg` dạng cột số). Chúng ta cần nâng cấp thành ghi chép chi tiết từng hiệp lẻ (Ví dụ: Hiệp 1 nâng 80kg x 10 reps, Hiệp 2 nâng 85kg x 8 reps) mà **không được thay đổi cấu trúc bảng** của Supabase để giữ tính tương thích ngược và bảo toàn RLS.
* **Prompt đã dùng**:
  > *"Tôi đang dùng Next.js App Router và Supabase. Bảng `session_exercises` của tôi chỉ có các cột phẳng: `sets` (int), `reps` (int), `weight_kg` (numeric), `notes` (text). Tôi muốn nâng cấp giao diện cho phép người dùng nhập rep và kg cho từng Set riêng lẻ (ví dụ hiệp 1 là 60kg x 10, hiệp 2 là 65kg x 8). Hãy gợi ý phương pháp serialize dữ liệu này thành chuỗi JSON để lưu trữ trực tiếp vào cột `notes` hiện tại, kèm theo cách viết hàm client-side parser an toàn để hiển thị lại giao diện khi đọc dữ liệu cũ và mới."*
* **Giải thích kỹ thuật**: AI đã gợi ý phương pháp tuần tự hóa dữ liệu (Serialization) thành cấu trúc JSON dạng `{"setsDetail": [{"reps": 10, "weight_kg": 60}], "userNotes": "..."}` để ghi đè cột `notes`. Đồng thời hướng dẫn viết Fallback Handler kiểm tra chuỗi có phải JSON hợp lệ hay không. Nếu không, tự động fallback về cấu trúc phẳng truyền thống.
* **Kết quả**: Triển khai thành công tính năng nhập từng hiệp lẻ ở trang `/dashboard/sessions/new` và hiển thị badge ở `/dashboard/sessions/[id]` hoàn hảo mà không cần chạy SQL Migration đổi schema.

---

### 2. Prompt 2: Thuật toán tính toán chỉ số TDEE & BMR và phân bổ đa lượng (Macros)
* **Ngữ cảnh**: Cần phát triển bộ công cụ tính toán năng lượng tiêu hao tự động cho người dùng tại trang dinh dưỡng `/dashboard/nutrition`.
* **Prompt đã dùng**:
  > *"Viết một component React tính toán chỉ số BMR theo công thức Mifflin-St Jeor dựa trên cân nặng (kg), chiều cao (cm), tuổi và giới tính của người dùng. Sau đó, tính TDEE dựa trên hệ số hoạt động thể chất (Activity Level). Phân bổ chỉ số macro (Protein, Carbs, Fats) theo 3 mục tiêu: Siết cơ (Cut), Duy trì (Maintain), và Xả cơ (Bulk) với tỷ lệ phần trăm calo khoa học. Trả về cấu trúc code TypeScript tối ưu sử dụng Tailwind CSS."*
* **Giải thích kỹ thuật**: AI cung cấp thuật toán chính xác dựa trên nghiên cứu sinh lý học thể thao: BMR nam = `10W + 6.25H - 5A + 5`, nữ = `10W + 6.25H - 5A - 161`. Đồng thời chia tỷ lệ đa lượng chuẩn khoa học: Protein chiếm 30% (Cut) / 25% (Bulk), Carb chiếm 40% (Cut) / 50% (Bulk), Fats chiếm 30% (Cut) / 25% (Bulk).
* **Kết quả**: Xây dựng thành công trang `/dashboard/nutrition` với các thanh tiến trình SVG tròn động phản hồi lập tức khi người dùng thay đổi mục tiêu thể trạng.

---

### 3. Prompt 3: Web Audio API phát tiếng bíp đếm ngượcRest Timer
* **Ngữ cảnh**: Người tập cần tín hiệu âm thanh cảnh báo khi hết thời gian nghỉ giữa hiệp, đặc biệt là đếm ngược 3 giây cuối để chuẩn bị vào hiệp mới mà không cần cài file âm thanh vật lý `.mp3` (gây nặng bundle và lỗi đường dẫn tĩnh).
* **Prompt đã dùng**:
  > *"Tôi muốn viết một RestTimer component trong Next.js. Thay vì dùng file âm thanh tĩnh .mp3 dễ bị lỗi đường dẫn khi deploy lên production, hãy hướng dẫn tôi sử dụng Web Audio API của trình duyệt để tự động tạo sóng sin phát ra âm thanh dạng 'tích tắc' nhẹ ở giây thứ 3, 2, 1 và một tiếng 'bíp' dài tần số cao khi đồng hồ đếm ngược về 0."*
* **Giải thích kỹ thuật**: AI hướng dẫn sử dụng `window.AudioContext`, tạo ra một `OscillatorNode` dạng sóng hình sin (`sine`) ở tần số 600Hz với thời lượng 0.05 giây cho các giây cuối, và tần số 880Hz thời lượng 0.3 giây cho tiếng bíp kết thúc, kết hợp điều phối âm lượng thông qua `GainNode` để tránh tiếng nổ rè loa.
* **Kết quả**: Giao diện Rest Timer đếm ngược chạy mượt mà, phát ra tiếng tích tắc vô cùng chuyên nghiệp trực tiếp từ loa thiết bị di động mà không phát sinh thêm bất cứ tài nguyên tĩnh nào.

---

### 4. Prompt 4: Vẽ Social Share Card bằng HTML5 Canvas và tối ưu định dạng Tiếng Việt
* **Ngữ cảnh**: Cần xuất ảnh tóm tắt buổi tập dưới dạng ảnh thẻ có thiết kế gradient bắt mắt để chia sẻ lên mạng xã hội. Số liệu phải hiển thị đúng chuẩn định dạng dấu chấm phân tách phần nghìn của Việt Nam (ví dụ: `3.180 kg` thay vì `3,180 kg`).
* **Prompt đã dùng**:
  > *"Tôi cần viết một component React sử dụng HTML5 Canvas vẽ ảnh chia sẻ buổi tập. Ảnh phải hiển thị: Tên buổi tập, Ngày tập, Tổng khối lượng nâng (Volume). Cần vẽ bo tròn góc, nền gradient tối hiện đại, icon tạ. Đặc biệt, tổng khối lượng nâng phải được định dạng theo tiêu chuẩn Việt Nam (sử dụng dấu chấm làm dấu phân cách hàng nghìn, ví dụ: 3.180 kg). Hãy xuất ra URL base64 để người dùng tải xuống."*
* **Giải thích kỹ thuật**: AI hướng dẫn cách sử dụng `canvas.getContext('2d')`, thiết lập `createLinearGradient`, vẽ các cung tròn bo góc (`arcTo`), vẽ văn bản cân đối, và quan trọng nhất là sử dụng `.toLocaleString('vi-VN')` để định dạng số liệu chính xác theo ngôn ngữ Việt Nam.
* **Kết quả**: Tạo ra nút "Chia sẻ" xuất sắc ở trang chi tiết buổi tập, tạo ra ảnh thẻ cực kỳ sắc nét tải xuống trực tiếp trên cả máy tính và điện thoại.

---

### 5. Prompt 5: Đảo màu hệ thống Tailwind CSS v4 bằng CSS Variables để làm Light/Dark Mode
* **Ngữ cảnh**: Hệ thống ban đầu viết cứng các lớp màu tối (`bg-slate-950`, `text-slate-400`, `bg-slate-900`) trên hàng chục component. Việc sửa từng file thủ công rất tốn thời gian và dễ lỗi. Cần một phương án đảo ngược màu thông minh từ CSS Core của Tailwind v4.
* **Prompt đã dùng**:
  > *"Ứng dụng Next.js của tôi sử dụng Tailwind CSS v4. Hầu hết các thẻ card đang dùng màu slate cứng như bg-slate-950, bg-slate-900, border-slate-800, text-slate-400. Tôi muốn làm tính năng đổi màu Light/Dark Mode bằng cách khai báo lại các biến màu slate này trong `globals.css` tương ứng với lớp `html.light-theme`. Hãy cho tôi đoạn mã CSS cấu hình biến `@theme` của Tailwind v4 để hệ thống tự đảo ngược toàn bộ màu sắc khi chuyển đổi theme."*
* **Giải thích kỹ thuật**: AI đưa ra giải pháp ghi đè biến màu của Tailwind CSS v4 trong `@theme`. Cụ thể: Bằng cách định nghĩa các biến `--slate-950`, `--slate-900` trong `:root` cho Dark mode, và gán các giá trị sáng (như màu trắng, xám nhạt) cho chính các biến đó trong lớp `html.light-theme`, toàn bộ các class Tailwind như `bg-slate-950` sẽ tự động hóa thân thành nền sáng khi chuyển theme.
* **Kết quả**: Đột phá kỹ thuật xuất sắc nhất dự án, hệ thống chuyển đổi giao diện sáng/tối mượt mà tức thì trên toàn bộ các trang con chỉ bằng 1 nút nhấn trong Sidebar.

---

### 6. Prompt 6: Thiết kế Mobile Responsive Sidebar dạng Drawer
* **Ngữ cảnh**: Sidebar trên desktop rộng 256px cố định, khi xem trên thiết bị di động (PWA) sẽ che mất nội dung trang. Cần chuyển sidebar thành menu trượt (drawer) có nút hamburger trên di động.
* **Prompt đã dùng**:
  > *"Viết lại Sidebar component trong Next.js. Trên màn hình máy tính (lg:), sidebar hiển thị cố định bên trái rộng 64. Trên màn hình di động (<lg), sidebar mặc định ẩn đi, thay vào đó là một thanh Header mỏng trên cùng có logo và nút hamburger menu (☰). Khi bấm hamburger, sidebar sẽ trượt từ trái ra ngoài màn hình đè lên nội dung kèm theo lớp phủ mờ (backdrop-blur). Khi bấm chuyển trang hoặc bấm vùng mờ bên ngoài, sidebar sẽ tự động đóng lại."*
* **Giải thích kỹ thuật**: AI đã sử dụng Tailwind dynamic classes phối hợp giữa `translate-x-0` và `-translate-x-full` kết hợp `transition-transform duration-300`, bổ sung trạng thái React `mobileOpen` và bắt sự kiện thay đổi đường dẫn `usePathname` để tự động thu hồi Sidebar.
* **Kết quả**: Đạt trải nghiệm PWA điểm tuyệt đối, ứng dụng hoạt động hoàn hảo và mượt mà trên Safari iOS, Chrome Android.

---

## 📈 ĐÁNH GIÁ HIỆU QUẢ CỦA AI TOOL TRONG ĐỒ ÁN
1. **Tiết kiệm thời gian**: Giảm thiểu 80% thời gian nghiên cứu tài liệu thủ công cho các tính năng phức tạp (như Web Audio API và HTML5 Canvas).
2. **Tối ưu hóa cấu trúc**: Mã nguồn được sinh ra tuân thủ nghiêm ngặt các quy chuẩn tối tân của **Next.js App Router (React 19)** và **Tailwind CSS v4**, không sử dụng các thư viện ngoài lỗi thời.
3. **Bảo mật và hiệu năng**: AI hỗ trợ viết mã xử lý ngoại lệ an toàn, tối ưu kích thước bundle, giúp sản phẩm chạy mượt mà và biên dịch sản xuất (`npm run build`) đạt trạng thái **hoàn hảo không lỗi**.
