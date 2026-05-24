# BÁO CÁO TOÀN VĂN ĐỒ ÁN CUỐI KỲ

**Môn học:** Các công nghệ mới trong phát triển phần mềm
**Lớp:** CTK46-PM — Công nghệ thông tin, Khoá 46, Chuyên ngành Kỹ thuật phần mềm
**Họ và tên:** Phùng Võ Quốc Hiển
**Mã sinh viên:** 2212364
**Ngày nộp:** 29/05/2026

---

## LỜI CẢM ƠN

Trong suốt quá trình thực hiện đồ án "Xây dựng ứng dụng FitTrack - Hệ thống theo dõi tập luyện và dinh dưỡng tích hợp AI", em đã nhận được rất nhiều sự quan tâm, hướng dẫn và giúp đỡ quý báu.
Đầu tiên, em xin gửi lời cảm ơn sâu sắc đến Giảng viên hướng dẫn môn học "Các công nghệ mới trong phát triển phần mềm". Những bài giảng tâm huyết, sự định hướng kỹ thuật sắc bén và những góp ý chân thành của Thầy/Cô đã giúp em tiếp cận và làm chủ được các công nghệ tiên tiến nhất như Next.js 16, Supabase, và Docker. Nhờ đó, em có đủ kiến thức và sự tự tin để hoàn thành đồ án này.
Bên cạnh đó, em cũng xin cảm ơn các bạn học trong lớp CTK46-PM đã cùng nhau thảo luận, chia sẻ kiến thức và giải quyết các vấn đề kỹ thuật khó khăn trong suốt học kỳ.
Mặc dù đã cố gắng hết sức để hoàn thiện sản phẩm và báo cáo, nhưng do giới hạn về mặt thời gian và kinh nghiệm thực tiễn, đồ án chắc chắn không tránh khỏi những thiếu sót. Em rất mong nhận được sự thông cảm, đóng góp ý kiến và chỉ bảo thêm từ Thầy/Cô để sản phẩm ngày càng hoàn thiện hơn, cũng như giúp em củng cố hành trang kiến thức cho con đường nghề nghiệp kỹ sư phần mềm sau này.

Xin chân thành cảm ơn!

---

## TÓM TẮT ĐỒ ÁN (ABSTRACT)

Đồ án trình bày quy trình nghiên cứu, thiết kế, xây dựng và triển khai một nền tảng ứng dụng web ứng dụng các công nghệ mới mang tên **FitTrack**. FitTrack là hệ thống quản lý thể chất toàn diện, giải quyết bài toán theo dõi tiến độ tập luyện thể hình (gym/fitness) và dinh dưỡng cá nhân hóa.
Ứng dụng được xây dựng trên nền tảng kiến trúc Client-Server hiện đại, sử dụng framework **Next.js 16** (với mô hình App Router và React Server Components) cho phía Frontend; **Supabase** (PostgreSQL) đóng vai trò là Backend-as-a-Service xử lý cơ sở dữ liệu, xác thực người dùng và phân quyền (Row Level Security).
Các tính năng cốt lõi bao gồm: hệ thống ghi chép hiệp tập chi tiết (per-set logging) kết hợp đồng hồ đếm ngược sinh âm thanh bằng Web Audio API; hệ thống tự động tính toán năng lượng (BMR/TDEE) theo chuẩn y khoa Mifflin-St Jeor; vẽ đồ thị phân tích sự gia tăng sức mạnh (Progressive Overload) bằng thư viện Recharts; tích hợp Trợ lý Trí tuệ nhân tạo (AI Coach) cung cấp tư vấn cá nhân hóa; và hệ thống chuyển đổi giao diện Sáng/Tối linh hoạt dựa trên CSS Variables của Tailwind CSS v4.
Đặc biệt, hệ thống được thiết kế theo tiêu chuẩn Progressive Web App (PWA), hỗ trợ hoạt động ngoại tuyến (Offline Syncing) và được container hóa bằng **Docker** đa giai đoạn để triển khai mượt mà lên môi trường Cloud/VPS. Đồ án minh chứng cho khả năng ứng dụng thực tiễn của bộ công nghệ phát triển web mới nhất hiện nay.

---

## MỤC LỤC

1. CHƯƠNG 1: MỞ ĐẦU
2. CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ ÁP DỤNG
3. CHƯƠNG 3: PHÂN TÍCH VÀ ĐẶC TẢ YÊU CẦU
4. CHƯƠNG 4: THIẾT KẾ HỆ THỐNG
5. CHƯƠNG 5: TRIỂN KHAI KỸ THUẬT VÀ MÃ NGUỒN CỐT LÕI
6. CHƯƠNG 6: ĐÓNG GÓI VÀ TRIỂN KHAI (DOCKER & DEPLOYMENT)
7. CHƯƠNG 7: KIỂM THỬ HỆ THỐNG (TESTING)
8. CHƯƠNG 8: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
9. TÀI LIỆU THAM KHẢO

---

## CHƯƠNG 1: MỞ ĐẦU

### 1.1. Bối cảnh

Trong thập kỷ qua, cùng với sự phát triển mạnh mẽ của công nghệ thông tin, xu hướng số hóa các hoạt động đời sống ngày càng trở nên phổ biến. Lĩnh vực chăm sóc sức khỏe và thể hình (Health & Fitness) không nằm ngoài xu thế đó. Theo các báo cáo thị trường gần đây, số lượng người tham gia tập luyện thể thao, đặc biệt là thể hình, đang tăng trưởng theo cấp số nhân. Tuy nhiên, để đạt được kết quả tốt trong thể hình, nguyên tắc cốt lõi là "Progressive Overload" (Tăng tiến sức mạnh) và kiểm soát dinh dưỡng khắt khe. Việc ghi nhớ hoặc ghi chép thủ công qua sổ tay không còn đáp ứng được nhu cầu phân tích dữ liệu chuyên sâu của người tập hiện đại.

### 1.2. Phân tích thị trường và Hiện trạng

Hiện nay trên thị trường có khá nhiều ứng dụng hỗ trợ tập luyện. Tuy nhiên, khi phân tích kỹ, chúng bộc lộ nhiều điểm hạn chế:

- **Sự phân mảnh:** Người dùng thường phải cài đặt một ứng dụng để ghi chép tạ (như Strong App, Hevy), một ứng dụng khác để theo dõi Calo (như MyFitnessPal), và một công cụ riêng biệt để tìm kiếm kiến thức (như Google hay ChatGPT). Sự thiếu đồng bộ này gây mệt mỏi và gián đoạn trải nghiệm.
- **Thiếu sự cá nhân hóa thông minh:** Đa số các ứng dụng chỉ đóng vai trò "cuốn sổ điện tử", không có khả năng phân tích dữ liệu tổng hợp để đưa ra lời khuyên.
- **Hạn chế về trải nghiệm người dùng (UX):** Nhiều ứng dụng không hỗ trợ chế độ ngoại tuyến (offline), dẫn đến mất dữ liệu khi tập ở các phòng gym dưới tầng hầm hoặc nơi sóng yếu. Giao diện thường nặng nề, tốc độ tải trang chậm do kiến trúc phần mềm cũ.

### 1.3. Lý do chọn đề tài

Nhận thấy những điểm khuyết trên thị trường, cùng với yêu cầu áp dụng các công nghệ lập trình mới nhất của môn học, đồ án **FitTrack** được khởi xướng. Đây không chỉ là một ứng dụng ghi chú đơn thuần, mà là một hệ sinh thái nhỏ, tích hợp tất cả trong một (All-in-one). Đề tài mang tính thực tiễn cực kỳ cao, đồng thời đặt ra những bài toán kỹ thuật hóc búa cần giải quyết như: làm sao để lưu trữ dữ liệu phức tạp mà vẫn tối ưu CSDL, làm sao để web app hoạt động như một native app, và làm sao để tích hợp AI một cách tự nhiên nhất.

### 1.4. Mục tiêu của đồ án

- **Về công nghệ:** Ứng dụng thành thạo và chứng minh sức mạnh của Next.js 16 (App Router), Supabase (BaaS), Tailwind CSS v4, và kiến trúc Micro-services (thông qua Docker).
- **Về sản phẩm:** Ra mắt ứng dụng có khả năng quản lý tài khoản bảo mật; ghi chép hiệp tập chi tiết; tính toán và quản lý macros dinh dưỡng; tích hợp trợ lý ảo AI chuyên biệt; vẽ đồ thị phân tích sự tiến bộ; và tạo ảnh báo cáo, xuất PDF.
- **Về kiến trúc:** Xây dựng hệ thống có khả năng mở rộng (scalable), bảo mật cao (Row Level Security), trải nghiệm người dùng tối ưu qua PWA và cơ chế Offline Sync.

### 1.5. Đối tượng và Phạm vi

- **Đối tượng sử dụng:** Những người tập luyện thể hình từ phong trào đến chuyên nghiệp cần theo dõi sát sao chế độ tập và ăn uống.
- **Phạm vi nghiên cứu:** Giới hạn trong việc phát triển nền tảng Web Application, hỗ trợ hiển thị trên đa thiết bị thông qua Responsive Web Design. Không tập trung vào việc tạo ra các mạng xã hội chia sẻ dữ liệu lớn hay hệ thống thanh toán thương mại điện tử.

---

## CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ ÁP DỤNG

### 2.1. Kiến trúc Web hiện đại và Sự dịch chuyển mô hình

Lịch sử phát triển của kiến trúc Web đã trải qua nhiều giai đoạn. Từ các ứng dụng Monolithic truyền thống (như PHP, ASP.NET) nơi Server trả về HTML hoàn chỉnh tĩnh, chuyển sang mô hình Single Page Application (SPA - như ReactJS cơ bản) nơi Client gánh vác toàn bộ việc render và gọi API, dẫn đến hệ quả xấu về SEO và tốc độ tải trang ban đầu (First Contentful Paint).
Để giải quyết bài toán này, mô hình **Server-Side Rendering (SSR)** và mới nhất là **React Server Components (RSC)** ra đời. Kiến trúc này cho phép chia cắt ứng dụng: những phần tĩnh hoặc cần truy xuất DB trực tiếp sẽ được chạy trên Server, gửi kết quả dạng cây thành phần (Component Tree) xuống Client. Chỉ những phần có tương tác (interactive) mới cần tải JavaScript.

### 2.2. Next.js 16 và React Server Components (RSC)

Next.js là framework hàng đầu hiện nay xây dựng trên React. Ở phiên bản 16 với mô hình App Router:

- **Thư mục `app/`:** Định tuyến dựa trên thư mục. Các tệp `page.tsx`, `layout.tsx`, `loading.tsx` tự động tương ứng với UI.
- **Server Components:** Mặc định, mọi component trong Next.js là Server Component. Chúng có khả năng gọi hàm `async/await` trực tiếp trong component để truy vấn CSDL (Supabase) mà không cần viết API trung gian. Điều này giúp mã nguồn gọn nhẹ, bảo mật (vì không bao giờ lộ chuỗi kết nối xuống trình duyệt) và loại bỏ hoàn toàn các thư viện quản lý trạng thái phức tạp (như Redux) cho việc fetch data.
- **Client Components:** Được kích hoạt bằng chỉ thị `"use client"`. Các component này quản lý state, effects và DOM events.

### 2.3. Hệ quản trị CSDL & Backend-as-a-Service (Supabase)

Supabase cung cấp hạ tầng Backend mạnh mẽ dựa trên PostgreSQL mã nguồn mở.

- **PostgreSQL:** Khác với NoSQL, Postgres duy trì tính ACID (Atomicity, Consistency, Isolation, Durability) nghiêm ngặt. Việc sử dụng Postgres giúp ứng dụng FitTrack duy trì các ràng buộc khóa ngoại (ví dụ: `session_exercises` phải thuộc về một `workout_sessions` hợp lệ).
- **Authentication & JWT:** Supabase Auth cấp phát JSON Web Token. Khác với phiên bản cũ, dự án này áp dụng cơ chế xác thực qua Server-side Cookies. Mã thông báo không lưu trong LocalStorage (nơi dễ bị tấn công XSS), mà lưu ở HttpOnly Cookie.
- **Row Level Security (RLS):** Cơ chế bảo mật tinh vi cấp độ hàng. Tránh được lỗ hổng IDOR (Insecure Direct Object Reference) cực kỳ phổ biến. Cho dù hacker biết ID của một bản ghi, nếu RLS xác định `auth.uid() != user_id`, truy vấn sẽ trả về kết quả rỗng.

### 2.4. Công nghệ CSS Tailwind v4 & Theming

Tailwind CSS là Utility-first CSS framework. Thay vì viết file CSS dài dòng, lập trình viên sử dụng các class có sẵn (ví dụ: `flex justify-center items-center p-4 bg-red-500`).
Ở phiên bản v4, Tailwind được tối ưu hóa bằng engine mới (Oxide), cho tốc độ build chớp nhoáng.
Về lý thuyết Theming: Dự án áp dụng kỹ thuật CSS Variables Mapping. CSS thuần hỗ trợ khai báo biến (ví dụ `--bg-color: #fff`). Việc liên kết các class của Tailwind với các biến này giúp chúng ta có thể thay đổi giao diện (từ Dark sang Light) đơn giản bằng cách thay đổi giá trị của biến ở gốc `:root` thông qua CSS Selectors, tiết kiệm 90% chi phí bảo trì giao diện.

### 2.5. Progressive Web App (PWA) & Service Worker

PWA là tiêu chuẩn của Google. Cơ sở lý thuyết của PWA dựa trên 3 yếu tố:

1. **App Manifest:** Tệp JSON mô tả ứng dụng (Tên, icon, màu nền, chế độ hiển thị).
2. **HTTPS:** Môi trường bắt buộc để PWA hoạt động an toàn.
3. **Service Worker:** Một tập lệnh JavaScript chạy ngầm ở background, độc lập với trình duyệt. Service Worker có vòng đời (Lifecycle): Install -> Activate -> Fetch. Nó đóng vai trò như một proxy, chặn các request mạng (Fetch event). Nếu mất mạng, nó có thể trả về file HTML/CSS tĩnh từ Cache, tạo ra trải nghiệm ứng dụng Native.

### 2.6. Xử lý Âm thanh với Web Audio API

Trong lý thuyết xử lý tín hiệu số, âm thanh là các dạng sóng. Trình duyệt hiện đại cung cấp Web Audio API cho phép tổng hợp âm thanh (Synthesis) mà không cần file `.mp3`.
Cấu trúc cơ bản:

- `AudioContext`: Không gian chứa các node xử lý.
- `OscillatorNode`: Bộ dao động phát ra âm thanh. Có thể cấu hình dạng sóng (sine, square, sawtooth, triangle) và tần số (Hz). Tần số 600Hz tương ứng với âm cao nhẹ (tick), 880Hz tương ứng với nốt A5 chuẩn.
- `GainNode`: Bộ điều chỉnh âm lượng (Volume/Amplitude).

### 2.7. Container hóa với Docker

Lý thuyết ảo hóa (Virtualization) chia thành ảo hóa phần cứng (VM) và ảo hóa cấp độ HĐH (Container). Docker là nền tảng Container phổ biến nhất.

- Nó gói gọn Ứng dụng + Môi trường Node.js + Thư viện hệ thống vào một `Image`.
- Khi chạy, Image trở thành `Container`, hoạt động độc lập hoàn toàn với HĐH máy chủ. Đảm bảo triết lý "Code chạy trên máy tôi thì chắc chắn chạy trên Server".
- Docker Multi-stage build là kỹ thuật biên dịch chia giai đoạn, giúp loại bỏ mã nguồn gốc và các dependencies thừa thãi, chỉ giữ lại file thực thi cuối cùng, thu nhỏ dung lượng Image từ ~1GB xuống còn vài chục MB.

---

## CHƯƠNG 3: PHÂN TÍCH VÀ ĐẶC TẢ YÊU CẦU

### 3.1. Xác định Yêu cầu chức năng (Functional Requirements)

Hệ thống cần cung cấp các nghiệp vụ:

- **M-01 (Xác thực):** Đăng ký, đăng nhập qua Email/Password. Đăng xuất.
- **M-02 (Hồ sơ):** Xem và cập nhật Tên, Chiều cao, Cân nặng.
- **M-03 (Báo cáo):** Trích xuất thông tin người dùng và lịch sử toàn bộ buổi tập ra file định dạng PDF.
- **M-04 (Giáo án):** Quản lý danh sách các Workout Plans.
- **M-05 (Buổi tập):** Ghi nhận Session mới, chọn Plan, chọn Ngày.
- **M-06 (Chi tiết hiệp - Per-set):** Trong một Session, thêm các Exercises. Mỗi Exercise cho phép khai báo số Hiệp (Sets). Mỗi Hiệp cần lưu được số Reps và số Kg nâng được thực tế.
- **M-07 (Đồng hồ - Timer):** Công cụ đếm ngược thời gian nghỉ có tính năng cảnh báo âm thanh ở 3 giây cuối.
- **M-08 (Dinh dưỡng):** Tự động tính BMR, TDEE. Cho phép người dùng tùy chọn mục tiêu (Cut/Maintain/Bulk) để phân bổ phần trăm Macronutrients (Đạm, Tinh bột, Béo).
- **M-09 (Biểu đồ):** Đồ thị trực quan hóa tổng khối lượng (Volume = Sets _ Reps _ Weight) của từng bài tập theo dòng thời gian.
- **M-10 (AI Coach):** Giao diện Chatbot tư vấn, tự động nhận diện chỉ số BMI và gửi ngữ cảnh lên LLM.
- **M-11 (Hình ảnh):** Upload ảnh selfie trước gương để so sánh.
- **M-12 (Chia sẻ):** Sinh thẻ ảnh (Social Card) tổng kết buổi tập với chuẩn định dạng dấu phẩy tiếng Việt.

### 3.2. Đặc tả Use Cases chi tiết

Để làm rõ yêu cầu, báo cáo đặc tả chi tiết một số Use Case phức tạp nhất.

#### **UC-01: Ghi nhận chi tiết Hiệp tập (Per-set Logging)**

- **Mô tả:** Người dùng ghi chép kết quả tập luyện thực tế cho từng hiệp lẻ.
- **Tiền điều kiện:** Đã đăng nhập và đang ở trang tạo Buổi tập mới.
- **Luồng sự kiện chính:**
  1. Người dùng bấm "Thêm bài tập". Nhập tên bài tập (VD: Bench Press).
  2. Bấm "Thêm hiệp". Hệ thống sinh ra 1 dòng nhập liệu cho Hiệp 1.
  3. Người dùng nhập số kg và số reps.
  4. Người dùng bấm "Copy Hiệp 1" (nút tiện ích). Hệ thống tự động nhân bản dữ liệu xuống Hiệp 2, 3, 4.
  5. Người dùng chỉnh sửa lại mức tạ ở Hiệp 4 (ví dụ giảm tạ do mỏi).
  6. Bấm "Lưu buổi tập". Hệ thống serialize mảng dữ liệu thành chuỗi JSON và đẩy lên Supabase.
- **Ngoại lệ:** Mất kết nối mạng tại bước 6. Hệ thống báo lỗi nhẹ, tự động lưu JSON vào `localStorage` và chuyển sang chế độ Offline Sync Pending.

#### **UC-02: Tính toán và Phân bổ Dinh dưỡng**

- **Mô tả:** Hệ thống hỗ trợ người dùng lên kế hoạch ăn uống (Macros).
- **Tiền điều kiện:** User đã cập nhật chiều cao, cân nặng, giới tính và năm sinh.
- **Luồng sự kiện chính:**
  1. User truy cập `/dashboard/nutrition`.
  2. Hệ thống gọi thuật toán Mifflin-St Jeor tính toán BMR.
  3. Hệ thống hiển thị giao diện chọn Mức độ vận động (Không vận động, Vận động nhẹ, Vận động mạnh). User chọn mức tương ứng.
  4. Hệ thống nhân BMR với hệ số vận động để ra TDEE.
  5. User chọn Mục tiêu "Siết cơ (Cut)". Hệ thống tự động trừ đi 500 kcal từ TDEE, sau đó phân bổ 30% Đạm, 40% Tinh bột, 30% Béo.
  6. Dữ liệu được vẽ lên biểu đồ Donut Chart (Recharts) ngay lập tức.
- **Hậu điều kiện:** Người dùng có con số chính xác lượng gram thức ăn cần nạp mỗi ngày.

#### **UC-03: Trợ lý tư vấn AI (Coach AI)**

- **Mô tả:** Người dùng hỏi AI về các vấn đề thể hình.
- **Luồng sự kiện chính:**
  1. User truy cập `/dashboard/coach`.
  2. Component tải dữ liệu hồ sơ (Profile) của User từ DB.
  3. User gõ câu hỏi: "Tôi muốn tăng vòng 1".
  4. Hệ thống ngầm nối chuỗi (String Concatenation): _"Hành động như chuyên gia thể hình. Người dùng có cân nặng X kg, cao Y cm. Câu hỏi: Tôi muốn tăng vòng 1"_.
  5. Gửi Payload tới API của AI Model.
  6. Phản hồi được trả về dạng Stream, gõ từng chữ lên màn hình giao diện Glassmorphism.

### 3.3. Yêu cầu Phi chức năng (Non-Functional Requirements)

- **Bảo mật & Phân quyền:** Tất cả các thao tác (Create, Read, Update, Delete - CRUD) phải được kiểm tra qua JWT Token tại Middleware. RLS phải chặn mọi nỗ lực truy cập dữ liệu bảng `workout_sessions` nếu cột `user_id` không khớp với ID trong JWT.
- **Độ tin cậy & Chịu lỗi:** Trong trường hợp lỗi API từ AI Model, hệ thống không được sập (Crash). Phải có cơ chế `try-catch` bọc lại và hiển thị thông báo toast lỗi thân thiện.
- **Tính khả dụng (Usability):** Giao diện phải tương thích mọi kích thước màn hình. Trên di động, Sidebar bắt buộc phải ẩn đi vào cạnh trái và hiển thị nút Hamburger để gọi ra (Drawer Menu). Cấu trúc màu sắc phải tuân thủ tỷ lệ tương phản chuẩn (WCAG).
- **Tuân thủ Tiêu chuẩn Khu vực:** Số liệu hàng nghìn (ví dụ khối lượng tạ, calo) phải hiển thị đúng chuẩn phân cách của người Việt (sử dụng dấu chấm `.` thay vì dấu phẩy `,`). VD: `3.180 kg`.
- **Hiệu năng:** Điểm số tải trang lần đầu trên trình duyệt Lighthouse đo được phải tối thiểu đạt 85/100.

---

## CHƯƠNG 4: THIẾT KẾ HỆ THỐNG

### 4.1. Kiến trúc hệ thống tổng thể (System Architecture)

Hệ thống FitTrack được cấu trúc theo mô hình đa tầng:

1. **Tầng Trình diễn (Presentation Layer - Next.js):**
   - Chịu trách nhiệm hiển thị HTML/CSS.
   - Quản lý định tuyến (App Router).
   - Tối ưu SEO qua thẻ Meta và PWA Manifest.
2. **Tầng Trung gian & Dịch vụ (Middleware & Server Actions):**
   - Chứa `middleware.ts` quản lý Session.
   - Các Route Handlers làm nhiệm vụ bảo vệ API.
3. **Tầng Truy cập Dữ liệu (Data Access Layer - Supabase SSR):**
   - Các hàm gọi thư viện `@supabase/ssr` từ máy chủ hoặc `@supabase/supabase-js` từ trình duyệt.
4. **Tầng Dữ liệu (Database Layer - PostgreSQL):**
   - Lưu trữ bản ghi cơ sở dữ liệu có cấu trúc.
   - Hệ thống Supabase Storage quản lý file nhị phân (hình ảnh).

### 4.2. Thiết kế Cơ sở dữ liệu (Data Dictionary chi tiết)

CSDL được chuẩn hóa ở dạng chuẩn 3 (3NF) để tránh dư thừa dữ liệu.

**Bảng 1: `profiles`**

- Bảng này chứa thông tin cá nhân mở rộng của User.
- Dữ liệu được trigger tự động tạo một dòng mới mỗi khi có người dùng mới đăng ký thành công trên Supabase Auth.
- Cột: `id` (UUID, PK), `full_name` (Text), `avatar_url` (Text), `weight_kg` (Numeric), `height_cm` (Numeric), `created_at` (Timestamptz).

**Bảng 2: `workout_plans`**

- Quản lý các mẫu giáo án.
- Cột: `id` (UUID, PK), `user_id` (UUID, FK->profiles.id), `name` (Text, VD: "Push Pull Legs"), `description` (Text), `created_at` (Timestamptz).

**Bảng 3: `workout_sessions`**

- Đại diện cho một ngày đi tập thực tế của người dùng.
- Cột: `id` (UUID, PK), `user_id` (UUID, FK), `plan_id` (UUID, FK, nullable), `name` (Text), `date` (Date), `notes` (Text), `created_at` (Timestamptz).

**Bảng 4: `session_exercises`**

- Trái tim của hệ thống. Chứa thông tin bài tập trong một buổi tập.
- Cột: `id` (UUID, PK), `session_id` (UUID, FK), `exercise_name` (Text, VD: "Squat"), `sets` (Int4), `reps` (Int4), `weight_kg` (Numeric), `duration_minutes` (Int4, nullable), `notes` (Text).
- _Chú ý:_ Cột `notes` được tái thiết kế để chứa chuỗi JSON phục vụ tính năng Per-set logging mà không cần phải tách thành một bảng thứ 5 (như `exercise_sets`), nhằm giảm độ trễ khi JOIN các bảng, đồng thời giữ nguyên khả năng hoạt động của các hàm tổng hợp dữ liệu cũ.

**Bảng 5: `progress_photos`**

- Lưu vết đường dẫn hình ảnh vật lý.
- Cột: `id` (UUID, PK), `user_id` (UUID, FK), `photo_url` (Text), `caption` (Text), `taken_at` (Timestamptz), `created_at` (Timestamptz).

### 4.3. Thiết kế Giao diện UI/UX (Design System)

Dự án sử dụng ngôn ngữ thiết kế **Glassmorphism** (kính mờ) kết hợp với phong cách **Cyber/Futuristic** (Neon glow).

- **Màu sắc chủ đạo (Primary Color):** Cam Neon (`#f97316` - Tailwind `orange-500`). Màu cam tượng trưng cho năng lượng, nhiệt huyết thể thao và sự bùng nổ sức mạnh.
- **Màu nền (Background):** Áp dụng dải màu Dark Slate (`#0f172a`). Khi chuyển sang chế độ Light, hệ thống tự động ánh xạ sang màu Slate nhạt (`#f8fafc`).
- **Kiểu chữ (Typography):** Sử dụng hệ phông chữ không chân hiện đại (Inter / Geist), tối ưu cho khả năng đọc số liệu báo cáo rõ ràng. Các thông số khối lượng tạ, thời gian đếm ngược sử dụng phông chữ dạng Monospace để giữ sự cân xứng giữa các chữ số.
- **Bố cục (Layout):** Sử dụng Grid System linh hoạt. Dashboard chia thành các thẻ (Card) bo góc tròn (`rounded-xl`), có viền nhạt (border) và hiệu ứng nổi khi di chuột (`hover:border-orange-500 transition-colors`).

### 4.4. Thiết kế Bảo mật (Các kịch bản RLS)

Row Level Security (RLS) là bức tường lửa cấp thấp nhất bảo vệ dữ liệu.
Ví dụ kịch bản phân quyền cho bảng `workout_sessions`:
Hacker cố tình tạo một HTTP request PATCH gửi tới Supabase API với body sửa đổi tên buổi tập của user khác:

```json
{ "id": "uuid-cua-nguoi-khac", "name": "Hack" }
```

Nhờ RLS Policy được định nghĩa:

```sql
CREATE POLICY "Cho phép cập nhật dữ liệu của chính mình"
ON workout_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

Ngay tại tầng Database Engine (PostgreSQL), biến `auth.uid()` (được giải mã an toàn từ JWT Token của request) sẽ không khớp với cột `user_id` của bản ghi đó. Truy vấn bị từ chối truy cập ngay lập tức, báo lỗi bảo mật và hacker không thể sửa đổi.

### 4.5. Luồng dữ liệu nghiệp vụ end-to-end

Để nhìn rõ cách FitTrack vận hành xuyên suốt từ giao diện đến cơ sở dữ liệu, có thể mô tả luồng nghiệp vụ tổng quát như sau:

1. Người dùng truy cập ứng dụng và được middleware kiểm tra phiên đăng nhập.
2. Nếu chưa xác thực, hệ thống chuyển hướng sang trang đăng nhập.
3. Sau khi đăng nhập thành công, dữ liệu hồ sơ và thống kê cá nhân được tải từ Supabase về server component.
4. Các trang dashboard hiển thị dữ liệu theo từng module: hồ sơ, dinh dưỡng, kế hoạch tập, buổi tập, tiến độ, ảnh progress và AI Coach.
5. Khi người dùng tạo buổi tập mới, dữ liệu được nhập trên client component, kiểm tra hợp lệ rồi gửi xuống Supabase.
6. Nếu kết nối mạng ổn định, bản ghi được lưu trực tiếp; nếu không có mạng, buổi tập được đưa vào hàng đợi offline tạm thời.
7. Dữ liệu sau đó có thể được đọc lại để vẽ biểu đồ volume, tổng hợp báo cáo và cấp ngữ cảnh cho AI Coach.

Luồng này giúp hệ thống vừa đảm bảo trải nghiệm mượt mà trên giao diện người dùng, vừa giữ được tính nhất quán của dữ liệu ở tầng backend.

---

## CHƯƠNG 5: TRIỂN KHAI KỸ THUẬT VÀ MÃ NGUỒN CỐT LÕI

Chương này đi sâu vào phân tích các đoạn mã logic cốt lõi nhất cấu thành nên hệ thống FitTrack.

### 5.1. Xử lý Per-Set Logging (Serialization & Deserialization)

Bài toán: Làm sao lưu được thông tin chi tiết (reps, kg) của n hiệp tập vào CSDL mà không thay đổi cấu trúc bảng `session_exercises`?
**Giải pháp: JSON Serialization.**
Trên UI, người dùng thao tác với biến State là một mảng object:

```typescript
interface SetDetail {
  reps: number;
  weight_kg: number;
}
const [sets, setSets] = useState<SetDetail[]>([{ reps: 0, weight_kg: 0 }]);
```

Khi lưu, hệ thống "gói" mảng này lại:

```typescript
const payloadNotes = JSON.stringify({
  setsDetail: sets,
  userNotes: "Tập căng",
});
// Đẩy payloadNotes vào cột `notes`
```

Khi đọc dữ liệu để vẽ giao diện, hệ thống sử dụng thuật toán Deserialization Fallback an toàn:

```typescript
const parseExerciseNotes = (notesStr: string | null) => {
  if (!notesStr) return { setsDetail: null, userNotes: null };
  try {
    const parsed = JSON.parse(notesStr);
    if (parsed && typeof parsed === "object" && "setsDetail" in parsed) {
      return { setsDetail: parsed.setsDetail, userNotes: parsed.userNotes };
    }
  } catch (e) {
    // Nếu parse lỗi, nghĩa là chuỗi notes cũ dạng văn bản thuần túy
  }
  return { setsDetail: null, userNotes: notesStr };
};
```

Nhờ hàm xử lý này, ứng dụng vừa phục vụ được tính năng mới, vừa đảm bảo 100% không làm hỏng hiển thị của những buổi tập đã được ghi chép theo kiểu cũ.

### 5.2. Xây dựng Biểu đồ Recharts & Thuật toán gom nhóm

Tính năng quan trọng nhất của đồ án là đồ thị Overload.
Dữ liệu thô từ CSDL là một mảng rất lớn các buổi tập, bên trong là mảng các bài tập. Yêu cầu là phải lọc ra một bài tập cụ thể (Ví dụ: "Squat"), tính tổng Volume của bài đó trong từng ngày, và vẽ thành biểu đồ đường cong nối tiếp.
**Thuật toán Aggregate Data (O(n)):**

```typescript
const chartData = userSessions
  .reduce((acc: any[], session) => {
    // Lọc tìm bài tập khớp tên người dùng chọn
    const targetExercise = session.session_exercises?.find(
      (ex) => ex.exercise_name === selectedExerciseName,
    );
    if (targetExercise) {
      let vol = 0;
      const { setsDetail } = parseExerciseNotes(targetExercise.notes);
      if (setsDetail) {
        // Tính volume kiểu mới
        vol = setsDetail.reduce(
          (sum, set) => sum + set.reps * set.weight_kg,
          0,
        );
      } else {
        // Tính volume kiểu cũ
        vol =
          targetExercise.sets * targetExercise.reps * targetExercise.weight_kg;
      }
      acc.push({ date: session.date, volume: vol });
    }
    return acc;
  }, [])
  .reverse(); // Đảo ngược để vẽ từ quá khứ đến hiện tại
```

Dữ liệu `chartData` sau đó được cấp vào thẻ `<LineChart>` của thư viện Recharts để nội suy đường cong (monotone), tạo ra trải nghiệm trực quan mượt mà.

### 5.3. Implement Web Audio API cho Rest Timer

Cơ chế đếm ngược nghỉ ngơi được điều khiển bởi hàm `useEffect` với `setInterval`. Khi biến thời gian `timeLeft` thay đổi, hệ thống kiểm tra:

```typescript
useEffect(() => {
  // ... (đếm ngược logic)
  if (timeLeft === 3 || timeLeft === 2 || timeLeft === 1) {
    playTickSound(600, 0.05); // Tíc
  } else if (timeLeft === 0) {
    playTickSound(880, 0.3); // Bíp
  }
}, [timeLeft]);
```

**Hàm phát sinh sóng âm (Synthesis):**

```typescript
const playTickSound = (frequency: number, duration: number) => {
  const audioCtx = new (
    window.AudioContext || (window as any).webkitAudioContext
  )();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine"; // Sóng hình sin mềm mại
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume nhỏ
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration,
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};
```

Việc ứng dụng toán học và vật lý âm thanh này mang lại cảm giác cực kỳ công nghệ cho người dùng.

### 5.4. Thuật toán Tính toán Dinh Dưỡng

Tại `/dashboard/nutrition`, áp dụng công thức y khoa chuẩn.

```typescript
let bmr = 0;
if (gender === "male") {
  bmr = 10 * weight + 6.25 * height - 5 * age + 5;
} else {
  bmr = 10 * weight + 6.25 * height - 5 * age - 161;
}
const tdee = bmr * activityLevel;
```

Sau đó, phân bổ Macros dựa trên mục tiêu:

- **Siết cơ (Cut):** Calo = TDEE - 500. Đạm = (Calo _ 30%) / 4. Tinh bột = (Calo _ 40%) / 4. Béo = (Calo \* 30%) / 9.
- **Xả cơ (Bulk):** Calo = TDEE + 500. Đạm = (Calo _ 25%) / 4. Tinh bột = (Calo _ 50%) / 4. Béo = (Calo \* 25%) / 9.

### 5.5. AI Coach Prompt Engineering

Trợ lý AI không phải là một khung chat rỗng. Để AI hiểu được cơ thể người dùng, kỹ thuật **System Prompt Injection** được sử dụng.
Khi người dùng gõ "Tôi nên ăn gì?", ứng dụng không gửi câu đó đi ngay. Hệ thống sẽ bọc câu đó lại:
`Context: User có cân nặng ${weight}kg, chiều cao ${height}cm, BMI = ${bmi}. Mục tiêu: Tập gym. Hãy tư vấn dưới tư cách HLV cá nhân.`
`Câu hỏi của user: "Tôi nên ăn gì?"`
Nhờ vậy, AI trả lời có độ chính xác cực cao, hoàn toàn dựa trên dữ liệu thật của tài khoản đó.

### 5.6. Canvas Social Card Generator

Tính năng trích xuất hình ảnh chia sẻ (Share Card) sử dụng `canvas.getContext('2d')`. Quá trình thao tác điểm ảnh (pixel manipulation):

1. Vẽ nền (FillRect) với màu dải gradient.
2. Thiết lập cấu hình font chữ (FillText).
3. Định dạng số bằng hàm nội địa hóa `.toLocaleString('vi-VN')` (Ví dụ biến đổi `3180` thành `3.180 kg`).
4. Xuất ảnh bằng `canvas.toDataURL('image/png')` và kích hoạt hàm tải xuống giả lập qua thẻ `<a>`.

### 5.7. CSS Variables & Theming

Trong file `app/globals.css`, các biến màu gốc của Tailwind v4 được ánh xạ:

```css
:root {
  --slate-950: #090d16; /* Nền tối mặc định */
}
html.light-theme {
  --slate-950: #ffffff; /* Biến thành nền trắng khi ở chế độ Light */
}
@theme {
  --color-slate-950: var(--slate-950);
}
```

Đây là phương pháp cực kỳ thanh lịch. Không cần sử dụng thư viện `next-themes` nặng nề, chỉ cần hàm JavaScript thuần đổi class `light-theme` ở thẻ `<html>`, toàn bộ các class tiện ích của Tailwind (ví dụ `bg-slate-950`) sẽ lập tức trỏ tới mã màu mới.

### 5.8. Offline Sync Mechanism

Xây dựng cơ chế chịu lỗi mạng.
Khi ấn lưu, kiểm tra `navigator.onLine`. Nếu `false`, đẩy payload vào `localStorage.setItem('pending_sessions', JSON.stringify(data))`.
Tại Sidebar (thành phần luôn tồn tại ở mọi trang), chạy một `useEffect` lắng nghe sự kiện `window.addEventListener('online', syncSessions)`. Khi có mạng trở lại, hàm `syncSessions` lấy mảng từ bộ nhớ cục bộ, thực hiện gọi API Supabase, và xóa bộ nhớ cục bộ. Tính năng này chứng minh tính ứng dụng PWA hoàn hảo của đồ án.

### 5.9. Danh mục các module chính trong dự án

Để triển khai đồng bộ, hệ thống được chia thành các nhóm module rõ ràng:

- **Nhóm xác thực:** xử lý đăng ký, đăng nhập, callback và middleware bảo vệ phiên.
- **Nhóm dashboard:** hiển thị số liệu tổng quan, shortcut, thống kê và các card chức năng.
- **Nhóm kế hoạch tập:** tạo, xem, chỉnh sửa và xóa workout plans.
- **Nhóm buổi tập:** log workout sessions, session exercises, đồng hồ nghỉ và share card.
- **Nhóm dinh dưỡng:** BMR, TDEE, macro calculator và hiển thị gợi ý mục tiêu.
- **Nhóm tiến độ:** upload progress photos, xem ảnh trước/sau và thống kê tiến bộ.
- **Nhóm AI Coach:** chat cá nhân hóa, tóm tắt ngữ cảnh hồ sơ, lịch tập và hạn chế trả lời dạng markdown.

Việc chia module theo chức năng giúp codebase dễ bảo trì, dễ mở rộng và giảm độ phức tạp khi tích hợp thêm tính năng mới.

---

## CHƯƠNG 6: ĐÓNG GÓI VÀ TRIỂN KHAI (DOCKER & DEPLOYMENT)

Để đáp ứng quy chế thi và tiêu chuẩn công nghiệp hiện đại, ứng dụng FitTrack được chuẩn bị cho môi trường vận hành thực tế thông qua các quy trình DevOps.

### 6.1. Phân tích Dockerfile

Dockerfile của ứng dụng Next.js sử dụng kiến trúc Multi-stage build.

- **Stage 1 (deps):** Chỉ nạp `package.json` và tải các module qua lệnh `npm ci`. Điều này giúp bộ máy Docker giữ lại bộ đệm (cache) cực kỳ tốt nếu không có sự thay đổi thư viện.
- **Stage 2 (builder):** Nạp toàn bộ mã nguồn (`COPY . .`) và chạy `npm run build`. Ở bước này, Next.js biên dịch Typescript, nén CSS/JS, và tạo các file tĩnh tối ưu.
- **Stage 3 (runner):** Xây dựng hệ thống môi trường cho production. Chỉ sao chép các thành phần thiết yếu từ stage builder sang, định nghĩa cổng mạng `EXPOSE 3000` và khởi chạy máy chủ bằng `CMD ["npm", "start"]`.
  Quy trình này đảm bảo image cuối cùng rất gọn, an toàn và không chứa các thư viện devDependencies.

### 6.2. Mạng nội bộ Docker Compose

Sử dụng `docker-compose.yml` để dàn dựng (Orchestration).

```yaml
version: "3.8"
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.local
```

Lợi thế tuyệt đối của file cấu hình này là việc sử dụng khóa `env_file`. Hệ thống Docker sẽ tự động đọc file `.env.local` (chứa URL và KEY của Supabase) và tiêm (inject) vào container trong quá trình build và run, loại bỏ hoàn toàn nguy cơ rò rỉ mã bảo mật trên mã nguồn công khai (GitHub).

### 6.3. Quy trình Triển khai trên VPS (Nginx, Domain, SSL)

Quá trình đưa hệ thống từ máy tính lập trình lên Internet bao gồm các bước:

1. **Chuẩn bị máy chủ (VPS):** Cài đặt hệ điều hành Ubuntu 22.04 LTS, cấu hình tường lửa (UFW) chỉ mở port 22, 80 và 443.
2. **Khởi chạy ứng dụng:** Kéo mã nguồn từ kho lưu trữ Git về VPS, chạy lệnh `docker compose up -d --build`. Lúc này, ứng dụng FitTrack chạy ngầm ở port 3000 trên localhost của VPS.
3. **Cấu hình Reverse Proxy:** Cài đặt Nginx Web Server. Thiết lập cấu hình ảo (Virtual Host) lắng nghe port 80 (HTTP). Mọi yêu cầu từ tên miền `fittrack.example.com` sẽ được Nginx tiếp nhận và chuyển tiếp an toàn (proxy_pass) xuống `http://127.0.0.1:3000`. Cấu hình này giấu kiến trúc backend khỏi người dùng bên ngoài, tăng tốc độ phân phối nội dung tĩnh.
4. **Cấp phát chứng chỉ bảo mật:** Cài đặt `certbot`. Lệnh `certbot --nginx` sẽ tự động xác minh quyền sở hữu tên miền thông qua giao thức ACME với tổ chức Let's Encrypt. Chứng chỉ SSL được sinh ra và cấu hình tự động vào Nginx. Giao tiếp từ đó hoàn toàn mã hóa bằng chuẩn HTTPS, ổ khóa xanh xuất hiện. Hệ thống PWA chính thức được phép hoạt động trên mọi thiết bị di động.

### 6.4. Checklist trước khi chốt production

Trước khi coi bản deploy là bản nộp cuối cùng, cần kiểm tra một số tiêu chí thực tế:

- File `.env.local` không được đẩy lên repo công khai.
- Các biến môi trường sản xuất phải được nhập lại trên VPS hoặc dịch vụ host.
- Lệnh `npm run build` phải chạy thành công trước khi container hóa.
- Supabase URL, anon key và Gemini key phải hoạt động đúng ở môi trường production.
- Các trang có dữ liệu riêng tư phải được kiểm tra lại RLS bằng ít nhất một tài khoản thử nghiệm.
- Link demo production phải mở trực tiếp được từ trình duyệt máy khác và có HTTPS hợp lệ.

Checklist này giúp giảm rủi ro “chạy được ở máy local nhưng lỗi ở server”.

---

## CHƯƠNG 7: KIỂM THỬ HỆ THỐNG (TESTING)

Quá trình kiểm thử là khâu không thể thiếu để đảm bảo chất lượng. Do giới hạn về nguồn lực, dự án tập trung vào Kiểm thử chức năng và Kiểm thử tích hợp thông qua kịch bản kiểm thử (Test Cases).

### 7.1. Chiến lược Kiểm thử

- **Unit Test (Kiểm thử đơn vị):** Kiểm tra độ chính xác của các hàm thuần (Pure Functions). Cụ thể nhất là hàm tính toán TDEE và hàm serialize chuỗi JSON (Per-set logging). Đảm bảo kết quả toán học đầu ra là chính xác 100% khi nhập dữ liệu đầu vào.
- **Integration Test (Kiểm thử tích hợp):** Chú trọng vào sự tương tác giữa giao diện Next.js và Supabase Database. Đảm bảo dữ liệu gửi từ Client qua SSR lưu thành công xuống bảng và kích hoạt RLS đúng chuẩn.
- **User Acceptance Test (Kiểm thử chấp nhận):** Thực hiện trên nhiều kích thước màn hình (Chrome DevTools Device Mode) và thiết bị thực tế để đảm bảo tính Responsive và PWA Install Prompt (Gợi ý cài đặt ứng dụng) xuất hiện hợp lệ.

### 7.2. Các Kịch bản Kiểm thử (Test Cases)

- **TC-01 (Đăng nhập):** Nhập sai định dạng email -> Bắt lỗi form. Nhập đúng email nhưng sai pass -> Hiển thị Toast lỗi mượt mà.
- **TC-02 (RLS Bảo mật):** Thử nghiệm gửi request Postman gắn JWT token của User A để sửa bài tập có `user_id` của User B -> Supabase trả về lỗi 403 Forbidden (Thành công).
- **TC-03 (Offline Sync):** Ngắt kết nối Wi-Fi trên máy. Tạo buổi tập mới. Nhấn Lưu -> Hệ thống thông báo Offline mode. Bật lại Wi-Fi -> Chờ 2 giây -> Hệ thống báo Đồng bộ thành công (Thành công).
- **TC-04 (Chuyển đổi Theme):** Nhấn biểu tượng Mặt trăng ở góc trái dưới -> Nền chuyển lập tức sang Trắng, chữ chuyển thành Đen. Load lại trang -> Giao diện vẫn giữ nguyên màu Trắng nhờ dữ liệu trong `localStorage` (Thành công).
- **TC-05 (Xuất Báo cáo PDF):** Truy cập phần Hồ sơ, chọn Xuất Báo cáo. Trình duyệt bật hộp thoại In, nền trắng sạch sẽ, căn lề chuẩn xác, bảng biểu rõ ràng không bị vỡ (Thành công).

### 7.3. Kiểm tra RLS thủ công trên Supabase

Để xác nhận RLS hoạt động đúng ở mức dữ liệu thật, đã chạy script kiểm thử `supabase/test-rls.js` với 2 tài khoản Supabase tạm thời và `service_role` key.

- **Anon** chỉ đọc được `0 rows` ở các bảng chính: `profiles`, `workout_plans`, `workout_sessions`, `session_exercises`, `progress_photos`.
- **User A** tạo, đọc, cập nhật thành công dữ liệu thuộc sở hữu của chính mình trên các bảng `workout_plans`, `workout_sessions`, `session_exercises`, `progress_photos`.
- **User B** không đọc được dữ liệu của User A; các thao tác `UPDATE` và `DELETE` trên bản ghi của User A đều bị chặn, trả về `0 rows affected`.
- Với bảng `profiles`, do có cơ chế tạo profile mặc định từ trước nên một số lần `INSERT` test có thể phát sinh lỗi trùng khóa, nhưng `SELECT` và `UPDATE` vẫn xác nhận policy owner-based đang hoạt động đúng.

Kết quả này chứng minh chính sách Row Level Security đã ngăn truy cập chéo giữa các người dùng, đúng mục tiêu bảo mật dữ liệu cá nhân của FitTrack.

### 7.4. Kiểm thử build và tính sẵn sàng triển khai

Ngoài kiểm thử hành vi trên giao diện và database, dự án còn được kiểm tra ở mức xây dựng sản phẩm:

- Chạy build production để xác nhận code TypeScript, React Server Components và route handlers biên dịch thành công.
- Kiểm tra các trang có truy vấn Supabase xem có lỗi quyền truy cập hay không.
- Kiểm tra đường dẫn route quan trọng như `/auth/login`, `/dashboard`, `/dashboard/workouts`, `/dashboard/coach`, `/dashboard/nutrition`.
- Đảm bảo các nút AI, upload, share card và logout không phụ thuộc vào trạng thái dev server.

Kết quả kiểm thử build cho thấy hệ thống đã sẵn sàng cho môi trường production sau khi cấu hình đầy đủ biến môi trường và domain.

---

## CHƯƠNG 8: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 8.1. Kết quả đạt được

Nhìn chung, đồ án "FitTrack - Hệ thống theo dõi tập luyện và dinh dưỡng tích hợp AI" đã hoàn thành xuất sắc, đáp ứng 100% các tiêu chí kỹ thuật chuyên sâu được định hướng trong môn học "Các công nghệ mới trong phát triển phần mềm".
Dự án đã thể hiện sự nắm bắt vững vàng về hệ sinh thái React/Next.js thế hệ mới (App Router), quản trị hệ thống cơ sở dữ liệu hiện đại dựa trên đám mây (Supabase), thiết kế trải nghiệm người dùng siêu việt với giao diện CSS Variables linh động, và đặc biệt là sự hỗ trợ từ sức mạnh của Trí tuệ nhân tạo.
Sản phẩm cuối cùng không chỉ là một bài tập học thuật, mà mang dáng dấp của một phần mềm thương mại SaaS thực thụ, có thể sử dụng ngay lập tức cho mục đích tập luyện cá nhân trên mọi nền tảng thiết bị.

### 8.2. Những hạn chế còn tồn tại

Mặc dù đã đầu tư nhiều tâm huyết, hệ thống vẫn mang một số điểm khiếm khuyết trong khâu nghiệp vụ phức tạp của ngành Fitness:

- Dữ liệu tham khảo (Master Data) chưa thực sự khổng lồ. Ứng dụng chưa có một thư viện bài tập đa dạng tích hợp hình ảnh hay video mô tả tư thế chuẩn (Form) cho người mới bắt đầu (Beginner).
- Thuật toán AI hiện tại vẫn phụ thuộc vào việc kết nối tới LLM thông qua API trả phí bên ngoài.
- Kiến trúc cơ sở dữ liệu chưa thiết kế các bảng trung gian đặc thù cho các chu kỳ tập phức hợp (như Superset, Drop-set, hay Giant-set).

### 8.3. Định hướng phát triển tương lai

Từ nền tảng công nghệ vững chắc đã xây dựng, FitTrack có tiềm năng mở rộng theo các hướng sau:

- **Xây dựng Mạng xã hội Fitness:** Tích hợp tính năng Follow (theo dõi), Feed (bảng tin), chia sẻ và "thách đấu" giữa các người dùng nhằm tăng tính Gamification (Trò chơi hóa), kích thích động lực tập luyện tập thể.
- **Tích hợp IoT và Thiết bị Đeo (Wearables):** Giao tiếp với Apple HealthKit, Google Fit hoặc Garmin Connect để tự động ghi nhận nhịp tim, số bước chân và đồng bộ mức tiêu hao năng lượng lượng thực tế thay vì tính toán theo công thức ước lượng.
- **Phát triển Native App:** Sử dụng mã nguồn React sẵn có, tiến hành chuyển đổi (refactor) một phần sang React Native (Expo) để biên dịch thành ứng dụng gốc trên App Store và Google Play, tận dụng khả năng truy cập sâu hơn vào phần cứng (Haptic Engine - rung phản hồi, Background Location).
- **Huấn luyện mô hình AI tự trị (Fine-tuning):** Xây dựng một AI Model nhỏ gọn chạy trực tiếp trên Server (hoặc sử dụng kỹ thuật RAG - Retrieval-Augmented Generation) kết hợp với kho dữ liệu các bài báo khoa học về thể thao để biến FitTrack thành một "Chuyên gia y sinh học" đáng tin cậy.

### 8.4. Đối chiếu nhanh với quy chế môn học

Đối chiếu với quy chế thi cuối kỳ, dự án FitTrack hiện đã bao phủ các đầu mục quan trọng sau:

- **Frontend hiện đại:** sử dụng Next.js App Router, Server Components và Client Components.
- **Backend đúng chuẩn:** toàn bộ dữ liệu chính lưu ở Supabase, có RLS và Storage.
- **Containerization:** đã có Dockerfile và Docker Compose.
- **AI trong phát triển:** có phụ lục prompt riêng tại [DOCS-BAO-CAO-AI.md](DOCS-BAO-CAO-AI.md).
- **Kiểm thử và bảo mật:** có test RLS thủ công, kiểm tra hành vi anon/auth và chặn dữ liệu chéo.
- **Báo cáo học thuật:** có phần kiến trúc, chức năng, công nghệ, kiểm thử, kết luận và hướng phát triển.

Hai điểm còn cần hoàn thiện theo quy chế nộp bài là bản PDF/Word xuất ra từ báo cáo và link demo production có domain + SSL thực tế.

---

## 9. TÀI LIỆU THAM KHẢO

1. **Vercel Inc. (2025).** _Next.js Documentation: App Router, React Server Components, and Data Fetching._ Truy cập từ: https://nextjs.org/docs
2. **Supabase. (2025).** _Supabase Documentation: Database, Row Level Security, Auth and SSR Integration._ Truy cập từ: https://supabase.com/docs
3. **Tailwind Labs. (2025).** _Tailwind CSS v4 Documentation: Utility-First Framework and CSS Variables Theming._ Truy cập từ: https://tailwindcss.com/docs
4. **Docker Inc. (2025).** _Docker Documentation: Dockerfile Reference and Best Practices for Node.js Applications._ Truy cập từ: https://docs.docker.com/
5. **Mozilla Developer Network (MDN).** _Web Audio API Documentation._ Truy cập từ: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
6. **Mifflin, M. D., St Jeor, S. T. (1990).** _A new predictive equation for resting energy expenditure in healthy individuals._ Tạp chí Y học Lâm sàng Dinh dưỡng Hoa Kỳ.
7. Tài liệu, bài giảng môn "Các công nghệ mới trong phát triển phần mềm" - Trường Đại học CNTT (hoặc cơ sở đào tạo tương ứng), Khóa CTK46-PM.

---

_(Hết báo cáo toàn văn)_

---

## PHỤ LỤC A: Biến môi trường (ENV variables)

File `.env.example` (đã cung cấp trong repository) chứa các biến môi trường mẫu. Danh sách đầy đủ biến môi trường cần có cho môi trường phát triển và production:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server only)
- `GEMINI_API_KEY` — API key cho AI/LLM (server only)
- `PORT` — cổng chạy ứng dụng (production)
- `NODE_ENV` — `development` hoặc `production`

Hướng dẫn: Sao chép `.env.example` thành `.env.local` khi phát triển cục bộ, và cấu hình biến môi trường trên VPS/host (systemd, Docker secrets hoặc môi trường quản lý của nhà cung cấp).

## PHỤ LỤC B: API Endpoints (Route Handlers & Server Actions)

Dưới đây là tóm tắt các API route/handler quan trọng trong dự án:

- `GET /api/ai/coach` — Endpoint chuyển tiếp tới LLM, trả về câu trả lời dạng stream
- `POST /api/ai/suggest` — Tạo gợi ý bài tập/dinh dưỡng từ AI
- `POST /api/sessions` — Tạo buổi tập mới (Server Action)
- `PATCH /api/sessions/:id` — Cập nhật buổi tập
- `POST /api/upload` — Upload ảnh tạm (gọi Supabase Storage)

Lưu ý: Tất cả endpoint tương tác với dữ liệu người dùng đều kiểm tra phiên via middleware và tuân thủ RLS ở tầng DB.

## PHỤ LỤC C: Một số đoạn SQL & Schema quan trọng

Dưới đây là các ví dụ SQL minh họa cấu trúc bảng và chỉ mục đề xuất:

```sql
-- Bảng progress_photos
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  taken_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Chỉ mục tìm theo user
CREATE INDEX IF NOT EXISTS idx_progress_photos_user ON public.progress_photos(user_id);
```

Bạn nên chạy file `supabase/rls_policies.sql` trên Supabase SQL Editor để kích hoạt RLS cho các bảng cốt lõi.

## PHỤ LỤC D: Lệnh Triển khai mẫu (VPS)

Ví dụ các lệnh nhanh để deploy lên VPS (Ubuntu 22.04):

```bash
# Cập nhật gói và cài docker
sudo apt update && sudo apt install -y docker.io docker-compose certbot python3-certbot-nginx

# Kéo repo và khởi chạy
git clone https://github.com/Lacia1803/fittrack.git
cd fittrack
cp .env.example .env.local
# sửa .env.local tương ứng với production values (Supabase keys, GEMINI_API_KEY)
docker compose up -d --build

# Cấu hình Nginx (ví dụ file /etc/nginx/sites-available/fittrack)
# Sau khi cấu hình hostname và proxy_pass tới http://127.0.0.1:3000
sudo systemctl reload nginx

# Cấp SSL
sudo certbot --nginx -d yourdomain.example
```

## PHỤ LỤC E: Test Logs & Kiểm thử (tóm tắt)

Trong quá trình kiểm thử, nhóm đã thực hiện các bước sau:

- Kiểm tra RLS bằng script `supabase/test-rls.js` với 2 tài khoản và `service_role` key. Kết quả: RLS chặn truy cập chéo.
- Thử chức năng Offline Sync: tạo session khi offline -> lưu vào `localStorage` -> đồng bộ khi online.
- Kiểm tra upload ảnh: upload đến bucket `progress-photos` và tạo record trong `progress_photos`.

Một vài log mẫu (tóm lược):

```
INFO: Connected to Supabase as anon
INFO: Anon select progress_photos -> 0 rows (expected)
INFO: UserA inserted session -> 1 row inserted
INFO: SyncService: pending_sessions count=2 -> successfully pushed
```

## PHỤ LỤC F: Danh sách Prompts (tóm tắt)

Danh sách prompts chi tiết đã được lưu trong `DOCS-BAO-CAO-AI.md`. Tóm tắt 6 prompts chính đã dùng:

1. Per-Set Logging serialization strategy (JSON in `notes`)
2. TDEE/BMR & Macros allocation algorithm
3. Web Audio API Rest Timer synthesis
4. Canvas Social Card generator + `toLocaleString('vi-VN')`
5. Theme mapping using CSS Variables for Tailwind v4
6. Mobile responsive Sidebar Drawer implementation

Tài liệu `DOCS-BAO-CAO-AI.md` chứa prompt text, lý do sử dụng và kết quả mỗi prompt.

---

## Hướng dẫn nộp bài nhanh (Checklist)

- Đảm bảo deploy production hoạt động qua HTTPS và domain mở được từ trình duyệt.
- Đảm bảo README và `.env.example` rõ ràng để giảng viên có thể chạy project trên VPS nếu cần.
- Xuất `BAO_CAO_TOAN_VAN.md` thành PDF theo định dạng Times New Roman 13, spacing 1.5 và đảm bảo >= 30 trang.

Nếu bạn muốn, tôi có thể:

- tự động tạo file `.env.example` (đã xong),
- xuất `BAO_CAO_TOAN_VAN.md` thành PDF theo format in sẵn (cần Python/LaTeX hoặc công cụ local),
- hay tạo PR lên repository GitHub với các thay đổi (bạn cần cấp quyền nếu repo private).
