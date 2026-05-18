import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, TrendingUp, Camera, Zap, Brain, Apple, WifiOff, Smartphone } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background glowing decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600/5 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 flex-1 flex flex-col justify-center max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-16 md:mb-24">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-orange-500 animate-pulse" />
            <span className="text-2xl font-black tracking-wider text-white">FIT<span className="text-orange-500">TRACK</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/40 text-xs sm:text-sm">Đăng nhập</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform">Bắt đầu miễn phí</Button>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
          <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xxs sm:text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block mb-6">
            ✨ HỆ THỐNG FITNESS THẾ HỆ MỚI
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            NÂNG TẦM <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">THỂ HÌNH</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ghi nhận hiệp tập chi tiết, theo dõi calories dinh dưỡng, phân tích tiến trình Volume tăng tiến tạ và đồng hành cùng Trợ lý Coach AI thông minh.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base font-bold px-10 py-6 w-full sm:w-auto shadow-lg shadow-orange-500/20 active:scale-95 transition-transform">
                Trải nghiệm ngay →
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-sm sm:text-base px-8 py-6 w-full sm:w-auto">
                Tôi đã có tài khoản
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Dumbbell, title: 'Lịch tập & Ghi chép Hiệp lẻ', desc: 'Thiết lập giáo án cá nhân. Ghi nhận số rep, số kg của từng hiệp đơn lẻ (per-set) cực kỳ trực quan kèm Rest Timer thông minh.' },
            { icon: TrendingUp, title: 'Biểu đồ Overload tự động', desc: 'Vẽ đồ thị tăng tiến sức mạnh (Progressive Overload) theo thời gian cho từng bài tập cụ thể, kiểm soát volume chuẩn xác.' },
            { icon: Brain, title: 'Trợ lý Huấn luyện viên AI 🪄', desc: 'AI chuyên gia đọc dữ liệu thể trạng cá nhân, phân tích chỉ số BMI, đưa ra thực đơn và giáo án tập luyện tối ưu.' },
            { icon: Apple, title: 'Quản lý Dinh dưỡng & Calo', desc: 'Tự động tính toán lượng calo duy trì (TDEE). Theo dõi tỷ lệ đạm, tinh bột, chất béo hàng ngày với nhật ký ăn uống mượt mà.' },
            { icon: WifiOff, title: 'Ngoại tuyến & Tự động đồng bộ', desc: 'Tập luyện không lo mất mạng. Dữ liệu được lưu trữ an toàn trên thiết bị và tự động đồng bộ lên đám mây khi có kết nối trở lại.' },
            { icon: Smartphone, title: 'Ứng dụng PWA Độc lập', desc: 'Cài đặt trực tiếp lên màn hình điện thoại. Chạy mượt mà ở chế độ toàn màn hình như một ứng dụng native thực thụ.' },
          ].map((f, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/80 hover:border-orange-500/30 transition-all duration-300 rounded-2xl p-6 backdrop-blur-md group hover:-translate-y-1">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 w-fit mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 text-center text-slate-600 text-xxs sm:text-xs">
        <p>© {new Date().getFullYear()} FitTrack. Tất cả quyền được bảo lưu. Phát triển trên nền tảng thể thao khoa học.</p>
      </footer>
    </main>
  )
}