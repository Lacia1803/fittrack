'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, Play, Pause, RotateCcw, Check, Sparkles, Zap, Shield, RefreshCw, Cpu, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  // Email Form State
  const [email, setEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('Không spam. Mời dùng thử sẽ gửi trong 24 giờ.')
  const [emailMsgColor, setEmailMsgColor] = useState('text-slate-400')

  const handleEmailSubmit = () => {
    const value = email.trim()
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
    if (ok) {
      setEmailMsg('Đã nhận! FitTrack sẽ gửi lời mời sớm.')
      setEmailMsgColor('text-orange-500 font-medium')
      setEmail('')
    } else {
      setEmailMsg('Vui lòng nhập email hợp lệ để nhận lời mời.')
      setEmailMsgColor('text-red-400')
    }
  }

  // Hero Card Timer State
  const [remaining, setRemaining] = useState(90)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    let timerId: any = null
    if (timerRunning && remaining > 0) {
      timerId = setInterval(() => {
        setRemaining((prev) => prev - 1)
      }, 1000)
    } else if (remaining === 0) {
      setTimerRunning(false)
    }
    return () => clearInterval(timerId)
  }, [timerRunning, remaining])

  const toggleTimer = () => {
    if (remaining === 0) {
      setRemaining(90)
    } else {
      setTimerRunning(!timerRunning)
    }
  }

  const formatTimer = (secs: number) => {
    const min = String(Math.floor(secs / 60)).padStart(2, '0')
    const sec = String(secs % 60).padStart(2, '0')
    return `${min}:${sec}`
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-[#f3f6ff] relative overflow-hidden flex flex-col justify-between">
      {/* Background glowing decorations */}
      <div className="absolute top-[-120px] left-[-120px] w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-500/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-600/5 to-transparent blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 py-6 md:py-12 relative z-10 flex-1 flex flex-col justify-center max-w-6xl">
        {/* Topbar */}
        <header className="flex items-center justify-between mb-12 md:mb-16">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-orange-500 animate-pulse" />
            <span className="text-xl font-black tracking-[0.18em] uppercase text-white">FIT<span className="text-orange-500">TRACK</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Tính năng</a>
            <a href="#ecosystem" className="text-slate-400 hover:text-white transition-colors">Hệ sinh thái</a>
            <a href="#cta" className="text-slate-400 hover:text-white transition-colors">Bắt đầu</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/40 text-xs sm:text-sm">Đăng nhập</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-black text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg shadow-orange-500/20 active:scale-95 transition-transform">Dùng thử ngay</Button>
            </Link>
          </div>
        </header>

        {/* Hero split section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 md:mb-24">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="bg-orange-500/12 border border-orange-500/20 text-orange-500 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Workout & Nutrition
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.02] tracking-tight py-2">
              NÂNG TẦM <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 inline-block py-1">THỂ HÌNH</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
              Ghi từng set với rest timer, theo dõi macro dinh dưỡng và nhận tư vấn từ AI Coach — tất cả trong một hệ sinh thái tập luyện chuẩn premium.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-5 rounded-full shadow-xl shadow-orange-500/25 active:scale-95 transition-transform">
                  Xem dashboard
                </Button>
              </Link>
              <Link href="/dashboard/sessions/new">
                <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-white px-8 py-5 rounded-full">
                  Vào workout log
                </Button>
              </Link>
            </div>
            
            {/* Email subscription form */}
            <div className="pt-4 max-w-md">
              <div className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <input
                  type="email"
                  placeholder="Email của bạn để nhận mời dùng thử"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  className="bg-transparent border-0 text-white text-sm outline-none px-3 py-2 flex-1 placeholder:text-slate-500"
                />
                <button
                  onClick={handleEmailSubmit}
                  className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Nhận lời mời
                </button>
              </div>
              <div className={`text-xs mt-2 min-h-[18px] ${emailMsgColor}`}>{emailMsg}</div>
            </div>
          </div>

          {/* Interactive Right Column Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-white/8 to-white/2 border border-white/12 rounded-[20px] p-6 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Buổi tập hôm nay</span>
                <strong className="text-white font-semibold">Pull Day · 6 bài</strong>
              </div>
              
              {/* Interactive Timer */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Rest Timer</span>
                  <span className="text-3xl font-bold text-white font-mono tracking-wider">{formatTimer(remaining)}</span>
                </div>
                <button
                  onClick={toggleTimer}
                  className="bg-orange-500/18 hover:bg-orange-500/25 text-orange-500 text-xs font-bold px-4 py-2 rounded-full transition-colors active:scale-95"
                >
                  {remaining === 0 ? 'Làm lại' : timerRunning ? 'Tạm dừng' : 'Bắt đầu'}
                </button>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Set hiện tại</span>
                  <strong className="text-white font-semibold">Lat Pulldown · Set 3/5</strong>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>AI Coach</span>
                  <strong className="text-orange-500 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Giữ tempo 2-1-2 để tối ưu lưng
                  </strong>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Macro hôm nay</span>
                  <strong className="text-white font-semibold">1,850 kcal · P140 C170 F55</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="pt-12 mb-16 md:mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Chức năng thiết kế cho Athlete</h2>
            <p className="text-slate-400 text-sm mt-2">Mọi công cụ bạn cần để theo dõi thể hình một cách chuyên nghiệp.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Per-set workout logs + rest timer', desc: 'Ghi từng set theo thời gian thực, tự động nhắc nghỉ giữa set để giữ hiệu suất ổn định.', icon: Dumbbell },
              { title: 'Progressive overload charts', desc: 'Biểu đồ khối lượng tuần tự động, giúp bạn tăng tải có kiểm soát.', icon: Zap },
              { title: 'Contextual AI Coach', desc: 'AI hiểu lịch sử tập, nhịp nghỉ và mục tiêu để đưa lời khuyên chuẩn ngữ cảnh.', icon: Cpu },
              { title: 'Nutrition calculator', desc: 'Tính macro theo mục tiêu tăng cơ/giảm mỡ với gợi ý bữa ăn linh hoạt.', icon: Layers },
              { title: 'Offline sync & PWA', desc: 'Ghi log offline, đồng bộ lại khi có mạng — sẵn sàng mọi nơi.', icon: RefreshCw },
            ].map((f, idx) => (
              <div key={idx} className="bg-gradient-to-b from-white/8 to-white/2 border border-white/12 p-6 rounded-[20px] shadow-lg backdrop-blur-md flex flex-col justify-between min-h-[180px] hover:border-orange-500/30 transition-all duration-300">
                <div>
                  <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-500 w-fit mb-4">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ecosystem Section */}
        <section id="ecosystem" className="mb-16 md:mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Hệ sinh thái đồng bộ</h2>
            <p className="text-slate-400 text-sm mt-2">Dữ liệu di chuyển mượt mà giữa các mô-đun của hệ thống.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Workout Intelligence', desc: 'Tối ưu khối lượng, volume và nhịp nghỉ theo từng bài tập.' },
              { title: 'Nutrition & Recovery', desc: 'Macro rõ ràng, nhắc hydration và theo dõi giấc ngủ.' },
              { title: 'AI Coach 24/7', desc: 'Chat hỏi đáp nhanh, đề xuất thay thế bài tập và lịch phục hồi.' },
            ].map((eco, idx) => (
              <div key={idx} className="bg-gradient-to-b from-white/8 to-white/2 border border-white/12 p-6 rounded-[20px] shadow-lg backdrop-blur-md space-y-3 hover:border-orange-500/30 transition-all">
                <h3 className="text-white font-bold text-base">{eco.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{eco.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA section */}
        <section id="cta" className="bg-gradient-to-b from-white/8 to-white/2 border border-white/12 p-8 md:p-12 rounded-[20px] shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">Gia nhập FitTrack ngay hôm nay</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Premium dark mode. Dữ liệu cá nhân hoá. Tương tác mượt.</p>
          </div>
          <Link href="/dashboard/coach">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-8 py-5 rounded-full shadow-lg shadow-orange-500/20 active:scale-95 transition-transform shrink-0">
              Trải nghiệm AI Coach
            </Button>
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-slate-500 text-xs">
        <p>© {new Date().getFullYear()} FitTrack. Tất cả quyền được bảo lưu. Phát triển trên nền tảng thể thao khoa học.</p>
      </footer>
    </main>
  )
}