'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, User, Send, Sparkles, Key, Loader2, Dumbbell, Award, Flame, Brain } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Load profile, sessions, and API key
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      // Load recent sessions
      const { data: sess } = await supabase
        .from('workout_sessions')
        .select('*, session_exercises(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      setSessions(sess || [])
    }

    fetchData()

    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || ''
      setApiKey(savedKey)
    }

    // Welcoming message
    setMessages([
      {
        role: 'assistant',
        content: `Xin chào! Tôi là **Coach AI**, huấn luyện viên thể hình cá nhân của bạn. 🏋️‍♂️\n\nTôi có thể đọc dữ liệu tập luyện của bạn để phân tích hiệu suất, nhận xét BMI, và lên thực đơn dinh dưỡng. Bạn có thể sử dụng các gợi ý nhanh bên dưới hoặc tự nhập câu hỏi nhé!`,
        timestamp: new Date()
      }
    ])
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim())
    toast({ title: 'Đã lưu API Key thành công!' })
    setShowKeyInput(false)
  }

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key')
    setApiKey('')
    toast({ title: 'Đã xóa API Key!' })
    setShowKeyInput(false)
  }

  // Phân tích cục bộ nếu không có API Key
  const getLocalResponse = (prompt: string) => {
    const p = prompt.toLowerCase()
    
    // Tính BMI
    const weight = profile?.weight_kg || 70
    const height = profile?.height_cm || 170
    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)
    
    // Tính tổng volume
    const totalVolume = sessions.reduce((acc, s) => {
      const sVol = s.session_exercises?.reduce((sa: number, ex: any) => {
        return sa + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0))
      }, 0) || 0
      return acc + sVol
    }, 0)

    if (p.includes('bmi') || p.includes('chỉ số') || p.includes('thể trạng')) {
      let bmiAdvice = ''
      const bmiNum = parseFloat(bmi)
      if (bmiNum < 18.5) {
        bmiAdvice = `Thể trạng của bạn đang ở mức **Thiếu cân**. Bạn nên tập trung vào giáo án tăng cơ (Bulking), bổ sung thặng dư calo (+300 - 500 kcal/ngày) và ăn nhiều protein (khoảng 1.6g - 2g/kg trọng lượng cơ thể).`
      } else if (bmiNum < 25) {
        bmiAdvice = `Thể trạng của bạn đang ở mức **Bình thường (Cân đối)**. Đây là nền tảng tuyệt vời! Bạn có thể chọn hướng tăng cơ nạc (Lean Bulking) hoặc giảm mỡ giữ cơ (Recomposition) tuỳ mục tiêu cá nhân.`
      } else if (bmiNum < 30) {
        bmiAdvice = `Thể trạng của bạn đang ở mức **Thừa cân**. Lời khuyên là hãy tập luyện kháng lực đều đặn kết hợp thâm hụt calo nhẹ (-300 kcal/ngày) để giảm mỡ dần mà không mất đi khối lượng cơ bắp.`
      } else {
        bmiAdvice = `Thể trạng của bạn đang ở mức **Béo phì**. Bạn cần ưu tiên chế độ ăn thâm hụt calo kiểm soát chặt chẽ (-500 kcal/ngày), tăng cường vận động hàng ngày và tập tạ kết hợp các buổi Cardio nhẹ để bảo vệ tim mạch.`
      }

      return `📊 **PHÂN TÍCH THỂ TRẠNG CỦA BẠN:**\n\n- Chiều cao: **${height} cm**\n- Cân nặng: **${weight} kg**\n- Chỉ số BMI của bạn là: **${bmi}**\n\n💡 **Nhận xét chuyên môn:**\n${bmiAdvice}`
    }

    if (p.includes('tập luyện') || p.includes('đánh giá') || p.includes('buổi tập') || p.includes('lịch sử')) {
      if (sessions.length === 0) {
        return `🏋️ **ĐÁNH GIÁ TẬP LUYỆN:**\n\nBạn chưa log buổi tập nào trên hệ thống FitTrack. Hãy nhấn nút **"Tạo dữ liệu mẫu nhanh"** trên Dashboard hoặc tự tạo một buổi tập mới để tôi có thể phân tích chi tiết hiệu suất cho bạn nhé!`
      }

      return `🏋️ **ĐÁNH GIÁ TẬP LUYỆN CHI TIẾT:**\n\n- Tổng số buổi đã tập: **${sessions.length} buổi**\n- Tổng Volume tích luỹ: **${totalVolume.toLocaleString('vi-VN')} kg**\n- Buổi tập gần nhất: **${sessions[0]?.name}** (${sessions[0]?.date})\n\n💡 **Phân tích hiệu suất:**\nBuổi tập gần đây nhất của bạn đạt hiệu năng rất tốt. Để kích thích cơ bắp phát triển liên tục, hãy áp dụng nguyên tắc **Tăng tiến quá tải (Progressive Overload)** bằng cách thử tăng nhẹ 1-2kg tạ hoặc thêm 1 rep ở hiệp cuối cùng trong buổi tập tiếp theo nhé!`
    }

    if (p.includes('lịch tập') || p.includes('giáo án') || p.includes('lịch trình')) {
      return `📅 **GỢI Ý LỊCH TẬP TỐI ƯU (3 BUỔI/TUẦN - PUSH/PULL/LEGS):**\n\n*Đây là lịch tập phổ biến và hiệu quả nhất cho mọi cấp độ giúp tối ưu hoá thời gian phục hồi cơ bắp:*\n\n1. **Ngày 1 - PUSH DAY (Ngực, Vai, Tay sau)**:\n   - Flat Bench Press: 4 hiệp × 6-8 reps\n   - Dumbbell Shoulder Press: 3 hiệp × 8-10 reps\n   - Incline Dumbbell Fly: 3 hiệp × 12 reps\n   - Tricep Pushdown: 3 hiệp × 12 reps\n\n2. **Ngày 2 - PULL DAY (Lưng, Xô, Tay trước)**:\n   - Barbell Row hoặc Lat Pulldown: 4 hiệp × 8-10 reps\n   - Single Arm Dumbbell Row: 3 hiệp × 10 reps\n   - Bicep Dumbbell Curl: 3 hiệp × 12 reps\n   - Face Pulls (Vai sau): 3 hiệp × 15 reps\n\n3. **Ngày 3 - LEG DAY (Đùi trước, Mông, Đùi sau)**:\n   - Back Squat (Gánh đùi): 4 hiệp × 8 reps\n   - Romanian Deadlift (Đùi sau): 3 hiệp × 10 reps\n   - Leg Press: 3 hiệp × 12 reps\n   - Calf Raises (Bắp chuối): 3 hiệp × 15 reps`
    }

    if (p.includes('ăn uống') || p.includes('dinh dưỡng') || p.includes('calo') || p.includes('thực đơn')) {
      const bmr = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5) // Ước lượng nam 25 tuổi
      const tdee = Math.round(bmr * 1.375) // Tập luyện vừa phải
      return `🥗 **TƯ VẤN DINH DƯỠNG CÁ NHÂN HÓA:**\n\nDựa trên cân nặng **${weight}kg** và chiều cao **${height}cm** của bạn:\n\n- Lượng Calo duy trì ước tính (TDEE): **~${tdee} kcal/ngày**\n\n💡 **Đề xuất phân bổ Macros hàng ngày (Tăng cơ nạc):**\n- **Protein (Chất đạm)**: ~${Math.round(weight * 2)}g (${Math.round(weight * 2 * 4)} kcal) -> Giúp phục hồi và xây dựng sợi cơ.\n- **Carbs (Tinh bột)**: ~${Math.round(weight * 3.5)}g -> Cung cấp năng lượng tập luyện năng nổ.\n- **Fats (Chất béo tốt)**: ~${Math.round(weight * 0.8)}g -> Hỗ trợ điều hòa hormone nội tiết.\n\n*Mẹo: Hãy uống đủ 2-3 lít nước mỗi ngày và ăn một bữa ăn chứa tinh bột hấp thu nhanh + protein trước tập 1.5 tiếng để có hiệu suất tập cao nhất!*`
    }

    return `🤖 Cảm ơn câu hỏi của bạn! Tôi có thể hỗ trợ bạn sâu sắc nhất về: \n1. **Phân tích BMI & thể trạng**\n2. **Đánh giá hiệu suất tập luyện thực tế**\n3. **Gợi ý Lịch tập**\n4. **Thực đơn dinh dưỡng**.\n\n*Để trò chuyện hoàn toàn tự do với Trí tuệ Nhân tạo Gemini trực tiếp, bạn hãy click vào biểu tượng 🔑 ở góc trên để dán API Key của mình vào nhé!*`
  }

  // Gửi tin nhắn lên Gemini API
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input
    if (!textToSend.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const currentApiKey = localStorage.getItem('gemini_api_key') || ''

    if (!currentApiKey) {
      // Chạy chế độ phân tích chuyên gia tại chỗ
      setTimeout(() => {
        const localResponse = getLocalResponse(textToSend)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: localResponse,
          timestamp: new Date()
        }])
        setLoading(false)
      }, 1000)
      return
    }

    // Gửi trực tiếp lên Gemini 2.5 Flash API
    try {
      const weight = profile?.weight_kg || 70
      const height = profile?.height_cm || 170
      const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)
      const sessionSummary = sessions.map(s => `Buổi tập ${s.name} ngày ${s.date} có ${s.session_exercises?.length || 0} bài tập`).join(', ')

      const contextPrompt = `Bạn là Coach AI - Huấn luyện viên thể hình cá nhân xuất sắc của ứng dụng FitTrack.
Thông tin học viên: Cao ${height}cm, Nặng ${weight}kg, BMI ${bmi}.
Lịch sử tập luyện gần đây: ${sessionSummary || "Chưa có buổi tập nào"}.
Hãy trả lời câu hỏi sau của học viên một cách ngắn gọn, súc tích, mang tính động lực cao, sử dụng ngôn ngữ Markdown tiếng Việt chuyên nghiệp:
Câu hỏi: "${textToSend}"`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contextPrompt }] }]
          })
        }
      )

      const resData = await response.json()
      const aiReply = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi xin lỗi, có lỗi kết nối với trí tuệ nhân tạo. Vui lòng kiểm tra lại API Key hoặc thử lại sau.'

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiReply,
        timestamp: new Date()
      }])
    } catch (err: any) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Lỗi kết nối với máy chủ AI. Bạn hãy kiểm tra lại kết nối internet hoặc tính hợp lệ của Gemini API Key nhé.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    { text: '📊 Phân tích thể trạng & BMI', prompt: 'Hãy phân tích chỉ số thể trạng và BMI của tôi' },
    { text: '🏋️ Nhận xét hiệu suất tập luyện', prompt: 'Hãy đánh giá hiệu suất tập luyện gần đây của tôi' },
    { text: '📅 Gợi ý lịch tập tối ưu', prompt: 'Gợi ý lịch tập tối ưu 3 ngày 1 tuần cho tôi' },
    { text: '🥗 Tư vấn ăn uống tăng cơ', prompt: 'Tư vấn lượng Calo và Dinh dưỡng để tăng cơ' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)] max-h-[850px]">
      
      {/* Cột trái: Stats & Key Setup */}
      <div className="space-y-6 flex flex-col justify-between lg:col-span-1">
        
        {/* Profile Stats Quickcard */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-500" />
              Thông tin Huấn luyện
            </CardTitle>
            <CardDescription className="text-slate-400">Số liệu cơ thể dùng để phân tích</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
                <span className="text-slate-500 text-xs block">Chiều cao</span>
                <span className="text-lg font-bold text-white mt-1 block">{profile?.height_cm || '—'} cm</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
                <span className="text-slate-500 text-xs block">Cân nặng</span>
                <span className="text-lg font-bold text-white mt-1 block">{profile?.weight_kg || '—'} kg</span>
              </div>
            </div>

            <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-xs block">Chỉ số BMI ước tính</span>
                <span className="text-xl font-bold text-orange-500 mt-1 block">
                  {profile?.weight_kg && profile?.height_cm
                    ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
                    : 'Chưa có'}
                </span>
              </div>
              <Award className="h-8 w-8 text-orange-500/20" />
            </div>

            <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-xs block">Tổng số buổi tập tích luỹ</span>
                <span className="text-xl font-bold text-white mt-1 block">{sessions.length} buổi</span>
              </div>
              <Dumbbell className="h-8 w-8 text-slate-500/20" />
            </div>
          </CardContent>
        </Card>

        {/* API Key Panel */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" />
                Dịch vụ AI
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apiKey ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                {apiKey ? 'Live AI Mode' : 'Local Expert Mode'}
              </span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              {apiKey 
                ? 'Bạn đang trò chuyện tự do với trí tuệ nhân tạo Gemini 2.5 Flash cao cấp.' 
                : 'Đang chạy mô phỏng chuyên gia thể hình tại chỗ. Dán Gemini API Key của bạn để trò chuyện tự do.'}
            </p>

            <Button
              onClick={() => setShowKeyInput(!showKeyInput)}
              variant="outline"
              size="sm"
              className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
            >
              {apiKey ? '🔑 Thay đổi / Xoá API Key' : '🔑 Nhập Gemini API Key'}
            </Button>

            {showKeyInput && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <Input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-xs"
                />
                <div className="flex gap-2">
                  <Button onClick={saveApiKey} size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs py-1">
                    Lưu
                  </Button>
                  {apiKey && (
                    <Button onClick={clearApiKey} size="sm" variant="destructive" className="flex-1 text-xs py-1">
                      Xoá
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cột phải: Chat Interface */}
      <Card className="lg:col-span-2 bg-slate-900/40 border-slate-700/50 backdrop-blur-md flex flex-col h-full overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 flex flex-row items-center gap-3 py-4">
          <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-500">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-white text-md">Huấn Luyện Viên Cá Nhân AI</CardTitle>
            <CardDescription className="text-slate-500 text-xs">Phản hồi dựa trên khoa học thể thao & thể hình</CardDescription>
          </div>
        </CardHeader>

        {/* Khung chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 h-9 w-9 ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-orange-500 border border-slate-700/30'}`}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={`rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-slate-800/50 border border-slate-700/20 text-slate-100 rounded-tl-none'}`}>
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="bg-slate-800 text-orange-500 border border-slate-700/30 p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="bg-slate-800/50 border border-slate-700/20 rounded-2xl rounded-tl-none p-3.5 text-slate-400 text-xs sm:text-sm flex items-center gap-2">
                <span>Coach đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick action prompts */}
        <div className="p-3 bg-slate-950/20 border-t border-slate-800/60 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                className="text-[10px] sm:text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/40 transition-colors active:scale-95 disabled:opacity-50"
              >
                {qp.text}
              </button>
            ))}
          </div>

          {/* Form input chat */}
          <div className="flex gap-2 pt-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi cho Coach (VD: Tôi nên ăn gì sau tập?)..."
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm flex-1 focus-visible:ring-orange-500"
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 active:scale-95 transition-transform"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
