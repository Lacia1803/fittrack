"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Brain, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [nutrition, setNutrition] = useState({ calories: 0 });
  const [offlineCount, setOfflineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Load profile and sessions
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);

      const { data: sess } = await supabase
        .from("workout_sessions")
        .select("*, session_exercises(*)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      setSessions(sess || []);
    };

    fetchData();

    if (typeof window !== "undefined") {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const savedNut = localStorage.getItem(`nutrition_${todayStr}`);
      if (savedNut) {
        setNutrition(JSON.parse(savedNut));
      }

      const pending = JSON.parse(
        localStorage.getItem("pending_sessions") || "[]",
      );
      setOfflineCount(pending.length);

      // Load chat history
      const savedMessages = localStorage.getItem("fittrack_chat_history");
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          const hydrated = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(hydrated);
          return; // Skip initial welcome message if history exists
        } catch (e) {
          console.error("Failed to load chat history", e);
        }
      }
    }

    setMessages([
      {
        role: "assistant",
        content: `Chào bạn! Hôm nay FitTrack ghi nhận ${sessions.length || 5} buổi tập liên tiếp. Bạn muốn tối ưu phần nào? Hỏi nhanh về bài tập, tempo, macro và lịch phục hồi.`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("fittrack_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Phân tích cục bộ khi AI server bận
  const getLocalResponse = (prompt: string) => {
    const p = prompt.toLowerCase();

    const weight = profile?.weight_kg || 70;
    const height = profile?.height_cm || 170;
    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

    const totalVolume = sessions.reduce((acc, s) => {
      const sVol =
        s.session_exercises?.reduce((sa: number, ex: any) => {
          return sa + (ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0);
        }, 0) || 0;
      return acc + sVol;
    }, 0);

    if (p.includes("bmi") || p.includes("chỉ số") || p.includes("thể trạng")) {
      let bmiAdvice = "";
      const bmiNum = parseFloat(bmi);
      if (bmiNum < 18.5) {
        bmiAdvice =
          "Thể trạng của bạn đang ở mức Thiếu cân. Bạn nên tập trung vào giáo án tăng cơ (Bulking), bổ sung thặng dư calo (+300 - 500 kcal/ngày) và ăn nhiều protein (khoảng 1.6g - 2g/kg trọng lượng cơ thể).";
      } else if (bmiNum < 25) {
        bmiAdvice =
          "Thể trạng của bạn đang ở mức Bình thường (Cân đối). Đây là nền tảng tuyệt vời! Bạn có thể chọn hướng tăng cơ nạc (Lean Bulking) hoặc giảm mỡ giữ cơ (Recomposition) tuỳ mục tiêu cá nhân.";
      } else if (bmiNum < 30) {
        bmiAdvice =
          "Thể trạng của bạn đang ở mức Thừa cân. Lời khuyên là hãy tập luyện kháng lực đều đặn kết hợp thâm hụt calo nhẹ (-300 kcal/ngày) để giảm mỡ dần mà không mất đi khối lượng cơ bắp.";
      } else {
        bmiAdvice =
          "Thể trạng của bạn đang ở mức Béo phì. Bạn cần ưu tiên chế độ ăn thâm hụt calo kiểm soát chặt chẽ (-500 kcal/ngày), tăng cường vận động hàng ngày và tập tạ kết hợp các buổi Cardio nhẹ để bảo vệ tim mạch.";
      }

      return `📊 PHÂN TÍCH THỂ TRẠNG CỦA BẠN:\n\n- Chiều cao: ${height} cm\n- Cân nặng: ${weight} kg\n- Chỉ số BMI của bạn là: ${bmi}\n\n💡 Nhận xét chuyên môn:\n${bmiAdvice}`;
    }

    if (
      p.includes("tập luyện") ||
      p.includes("đánh giá") ||
      p.includes("buổi tập") ||
      p.includes("lịch sử")
    ) {
      if (sessions.length === 0) {
        return '🏋️ ĐÁNH GIÁ TẬP LUYỆN:\n\nBạn chưa log buổi tập nào trên hệ thống FitTrack. Hãy nhấn nút "Tạo dữ liệu mẫu nhanh" trên Dashboard hoặc tự tạo một buổi tập mới để tôi có thể phân tích chi tiết hiệu suất cho bạn nhé!';
      }

      return `🏋️ ĐÁNH GIÁ TẬP LUYỆN CHI TIẾT:\n\n- Tổng số buổi đã tập: ${sessions.length} buổi\n- Tổng Volume tích luỹ: ${totalVolume.toLocaleString("vi-VN")} kg\n- Buổi tập gần nhất: ${sessions[0]?.name} (${sessions[0]?.date})\n\n💡 Phân tích hiệu suất:\nBuổi tập gần đây nhất của bạn đạt hiệu năng rất tốt. Để kích thích cơ bắp phát triển liên tục, hãy áp dụng nguyên tắc Tăng tiến quá tải (Progressive Overload) bằng cách thử tăng nhẹ 1-2kg tạ hoặc thêm 1 rep ở hiệp cuối cùng trong buổi tập tiếp theo nhé!`;
    }

    if (
      p.includes("lịch tập") ||
      p.includes("giáo án") ||
      p.includes("lịch trình")
    ) {
      return "📅 GỢI Ý LỊCH TẬP TỐI ƯU (3 BUỔI/TUẦN - PUSH/PULL/LEGS):\n\n*Đây là lịch tập phổ biến và hiệu quả nhất cho mọi cấp độ giúp tối ưu hoá thời gian phục hồi cơ bắp:*\n\n1. Ngày 1 - PUSH DAY (Ngực, Vai, Tay sau):\n   - Flat Bench Press: 4 hiệp × 6-8 reps\n   - Dumbbell Shoulder Press: 3 hiệp × 8-10 reps\n   - Incline Dumbbell Fly: 3 hiệp × 12 reps\n   - Tricep Pushdown: 3 hiệp × 12 reps\n\n2. Ngày 2 - PULL DAY (Lưng, Xô, Tay trước):\n   - Barbell Row hoặc Lat Pulldown: 4 hiệp × 8-10 reps\n   - Single Arm Dumbbell Row: 3 hiệp × 10 reps\n   - Bicep Dumbbell Curl: 3 hiệp × 12 reps\n   - Face Pulls (Vai sau): 3 hiệp × 15 reps\n\n3. Ngày 3 - LEG DAY (Đùi trước, Mông, Đùi sau):\n   - Back Squat (Gánh đùi): 4 hiệp × 8 reps\n   - Romanian Deadlift (Đùi sau): 3 hiệp × 10 reps\n   - Leg Press: 3 hiệp × 12 reps\n   - Calf Raises (Bắp chuối): 3 hiệp × 15 reps";
    }

    if (
      p.includes("ăn uống") ||
      p.includes("dinh dưỡng") ||
      p.includes("calo") ||
      p.includes("thực đơn")
    ) {
      const bmr = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
      const tdee = Math.round(bmr * 1.375);
      return `🥗 TƯ VẤN DINH DƯỠNG CÁ NHÂN HÓA:\n\nDựa trên cân nặng ${weight}kg và chiều cao ${height}cm của bạn:\n\n- Lượng Calo duy trì ước tính (TDEE): ~${tdee} kcal/ngày\n\n💡 Đề xuất phân bổ Macros hàng ngày (Tăng cơ nạc):\n- Protein (Chất đạm): ~${Math.round(weight * 2)}g (${Math.round(weight * 2 * 4)} kcal) -> Giúp phục hồi và xây dựng sợi cơ.\n- Carbs (Tinh bột): ~${Math.round(weight * 3.5)}g -> Cung cấp năng lượng tập luyện năng nổ.\n- Fats (Chất béo tốt): ~${Math.round(weight * 0.8)}g -> Hỗ trợ điều hòa hormone nội tiết.\n\n*Mẹo: Hãy uống đủ 2-3 lít nước mỗi ngày và ăn một bữa ăn chứa tinh bột hấp thu nhanh + protein trước tập 1.5 tiếng để có hiệu suất tập cao nhất!*`;
    }

    return "🤖 Cảm ơn câu hỏi của bạn! Tôi có thể hỗ trợ bạn sâu sắc nhất về: \n1. Phân tích BMI & thể trạng\n2. Đánh giá hiệu suất tập luyện thực tế\n3. Gợi ý Lịch tập\n4. Thực đơn dinh dưỡng.\n\n*Khi AI server bận, tôi sẽ phản hồi bằng chế độ chuyên gia cục bộ để bạn vẫn có tư vấn nhanh.*";
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        toast({
          title: "AI đang quá tải",
          description: `Bạn thử lại sau ${data.retryAfter || 60} giây. Đang chuyển sang chế độ cục bộ.`,
        });
        const localResponse = getLocalResponse(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: localResponse,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        toast({
          title: "Lỗi từ AI",
          description:
            errData.error ||
            errData.message ||
            "Máy chủ AI trả về lỗi. Đang chuyển sang phản hồi cục bộ.",
          variant: "destructive",
        });

        const localResponse = getLocalResponse(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: localResponse,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const resData = await response.json();
      const aiReply =
        resData.reply || "Tôi xin lỗi, AI không thể phản hồi ngay bây giờ.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      const localResponse = getLocalResponse(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: localResponse,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (!confirm("Bạn có chắc chắn muốn xoá toàn bộ lịch sử tư vấn?")) return;

    localStorage.removeItem("fittrack_chat_history");
    const initialMsg: Message = {
      role: "assistant",
      content: `Chào bạn! Hôm nay FitTrack ghi nhận ${sessions.length || 0} buổi tập liên kết. Bạn muốn tối ưu phần nào? Hỏi nhanh về bài tập, tempo, macro và lịch phục hồi.`,
      timestamp: new Date(),
    };
    setMessages([initialMsg]);
    toast({ title: "Đã xoá lịch sử chat" });
  };

  const quickPrompts = [
    { text: "Lịch tập 4 tuần", prompt: "Lịch tập 4 tuần tăng cơ?" },
    { text: "Tempo set 3", prompt: "Nên chỉnh tempo set 3 thế nào?" },
    { text: "Bữa ăn 1,900 kcal", prompt: "Gợi ý bữa ăn 1,900 kcal" },
    { text: "Tăng tải?", prompt: "Có nên tăng tải tuần này?" },
  ];

  const weight = profile?.weight_kg || 70;
  const height = profile?.height_cm || 170;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
  const tdee = Math.round(bmr * 1.375);
  const targetCal = tdee;
  const remainingCal = Math.max(targetCal - (nutrition.calories || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
      {/* Cột trái (Sidebar) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-gradient-to-b from-white/8 to-white/2 border border-white/12 rounded-[20px] p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-500" />
            Trạng thái tập luyện
          </div>

          <div className="space-y-3">
            {/* Goal card */}
            <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
              <strong className="text-white text-sm block">
                Tuần 21 · Tăng cơ
              </strong>
              <small className="text-slate-400 text-xs mt-0.5 block">
                AI Coach đang theo dõi volume tập của bạn
              </small>
            </div>

            {/* Nutrition summary */}
            <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
              <strong className="text-white text-sm block">
                Dinh dưỡng hôm nay
              </strong>
              <small className="text-slate-400 text-xs mt-0.5 block">
                {nutrition.calories || 0} kcal ăn vào · Còn lại {remainingCal}{" "}
                kcal
              </small>
            </div>

            {/* Recommendation */}
            <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
              <strong className="text-white text-sm block">
                Gợi ý bài tập mới
              </strong>
              <small className="text-slate-400 text-xs mt-0.5 block">
                Thay thế Dumbbell Incline Press → Cable Fly
              </small>
            </div>

            {/* Offline Sync info */}
            <div className="p-3.5 rounded-xl border border-white/8 bg-white/[0.02]">
              <strong className="text-white text-sm block">Offline Sync</strong>
              <small className="text-slate-400 text-xs mt-0.5 block">
                Đã đồng bộ {sessions.length} buổi tập
                {offlineCount > 0 ? ` · ${offlineCount} buổi đang chờ` : ""}
              </small>
            </div>
          </div>
        </div>

        {/* AI Coach Status */}
        <Card className="premium-glass-card">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Coach Server
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-400">
                Secure Mode
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-normal">
              AI chạy qua server bảo mật, không lộ API key. Khi server bận, hệ
              thống tự động trả lời bằng chế độ chuyên gia cục bộ.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cột phải (Chat Interface) */}
      <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              AI Coach · Tư vấn theo ngữ cảnh
            </h1>
            <p className="text-slate-400 text-xs">
              Hỏi nhanh về bài tập, tempo, macro và lịch phục hồi.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearChat}
              className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs"
              title="Xoá lịch sử"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xoá lịch sử
            </button>
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white text-xs transition-colors underline"
            >
              Quay lại dashboard
            </Link>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 pb-4">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-orange-500 hover:border-orange-500/40 text-xs bg-white/[0.03] transition-colors active:scale-95 disabled:opacity-50"
            >
              {qp.text}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-gradient-to-b from-white/8 to-white/2 border border-white/12 rounded-[20px] shadow-2xl backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message flex p-3 rounded-2xl max-w-[75%] leading-relaxed text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-orange-500/20 border border-orange-500/45 text-white"
                    : "bg-white/[0.05] border border-white/10 text-white"
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bg-white/[0.05] border border-white/10 p-3 rounded-2xl max-w-[75%] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span className="text-slate-400 text-xs">
                  AI Coach đang phân tích...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="flex gap-2.5 p-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi cho AI Coach..."
              disabled={loading}
              className="bg-transparent border-0 text-white text-sm outline-none px-3 py-2 flex-1 placeholder:text-slate-500 focus:ring-0"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
