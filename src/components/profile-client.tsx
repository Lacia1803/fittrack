"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  User,
  Weight,
  Ruler,
  Save,
  FileText,
  Activity,
  ShieldQuestion,
  Target,
  Dumbbell,
} from "lucide-react";
import { parseExerciseNotes } from "@/lib/exercise-notes";

export default function ProfileClient({
  profile,
}: {
  profile: Profile | null;
}) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [weightKg, setWeightKg] = useState<number | "">(
    profile?.weight_kg || "",
  );
  const [heightCm, setHeightCm] = useState<number | "">(
    profile?.height_cm || "",
  );
  const [gender, setGender] = useState(profile?.gender || "");
  const [experienceLevel, setExperienceLevel] = useState(
    profile?.experience_level || "",
  );
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitness_goal || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase() || "U";

  const bmi =
    weightKg && heightCm
      ? (Number(weightKg) / Math.pow(Number(heightCm) / 100, 2)).toFixed(1)
      : null;

  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return { label: "Thiếu cân", color: "text-blue-400" };
    if (bmi < 25) return { label: "Bình thường", color: "text-green-400" };
    if (bmi < 30) return { label: "Thừa cân", color: "text-yellow-400" };
    return { label: "Béo phì", color: "text-red-400" };
  };

  // ===================================================================
  // Native PDF Export (Print Stylesheet Optimization)
  // ===================================================================
  // Compiles bio metrics and workout history, opens a print-friendly iframe,
  // and triggers the browser's native Vector PDF printing dialog instantly.
  const handleExportReport = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userSessions, error } = await supabase
        .from("workout_sessions")
        .select("*, session_exercises(*)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      if (!userSessions || userSessions.length === 0) {
        toast({
          title: "Chưa có dữ liệu buổi tập để xuất báo cáo!",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const totalVol = userSessions.reduce((acc, s) => {
        const sVol =
          s.session_exercises?.reduce((sa: number, ex: any) => {
            const { setsDetail } = parseExerciseNotes(ex.notes);
            if (setsDetail) {
              return (
                sa +
                setsDetail.reduce(
                  (sum, set) =>
                    sum +
                    (Number(set.reps) || 0) * (Number(set.weight_kg) || 0),
                  0,
                )
              );
            }
            return sa + (ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0);
          }, 0) || 0;
        return acc + sVol;
      }, 0);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Vui lòng cho phép mở pop-up để xuất báo cáo",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const bmiVal =
        weightKg && heightCm
          ? (Number(weightKg) / Math.pow(Number(heightCm) / 100, 2)).toFixed(1)
          : "N/A";

      let sessionsHTML = "";
      userSessions.forEach((s, idx) => {
        let exercisesHTML = "";
        s.session_exercises?.forEach((ex: any, eIdx: number) => {
          const { setsDetail } = parseExerciseNotes(ex.notes);
          let setsHTML = "";
          if (setsDetail) {
            setsHTML = setsDetail
              .map(
                (set, sIdx) =>
                  `Hiệp ${sIdx + 1}: ${set.weight_kg === 0 || set.weight_kg === "" ? "BW" : `${set.weight_kg}kg`} × ${set.reps}`,
              )
              .join(" | ");
          } else {
            setsHTML = `${ex.sets} hiệp × ${ex.reps} reps ${ex.weight_kg !== null ? `@ ${ex.weight_kg === 0 ? "BW" : `${ex.weight_kg}kg`}` : ""}`;
          }
          exercisesHTML += `
            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">
              <strong>${eIdx + 1}. ${ex.exercise_name}</strong> - <span style="font-family: monospace; color: #475569;">${setsHTML}</span>
            </div>
          `;
        });

        sessionsHTML += `
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; page-break-inside: avoid; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #f97316; padding-bottom: 4px;">
              <span style="font-size: 15px; font-weight: bold; color: #0f172a;">${idx + 1}. ${s.name}</span>
              <span style="font-size: 12px; font-weight: bold; color: #f97316;">${s.date}</span>
            </div>
            ${s.notes ? `<p style="font-size: 12px; color: #64748b; font-style: italic; margin-top: 0; margin-bottom: 8px;">Ghi chú: ${s.notes}</p>` : ""}
            <div>${exercisesHTML}</div>
          </div>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>FitTrack_BaoCao_${fullName.replace(/\s+/g, "_")}</title>
            <style>
              body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 24px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
              h1 { color: #f97316; border-bottom: 3px solid #f97316; padding-bottom: 8px; margin-bottom: 4px; font-size: 24px; }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; margin-top: 20px; }
              .header-table td { padding: 10px; border: 1px solid #e2e8f0; font-size: 14px; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h1>FitTrack • BÁO CÁO TIẾN TRÌNH LUYỆN TẬP</h1>
              <button onclick="window.print()" style="background: #f97316; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">🖨️ In Báo Cáo / Lưu PDF</button>
            </div>
            <p style="color: #64748b; margin-top: 4px; font-size: 13px;">Tài liệu được xuất tự động từ hệ thống theo dõi thể trạng FitTrack</p>

            <table class="header-table">
              <tr>
                <td style="background: #f8fafc; font-weight: bold; width: 25%;">Họ và tên:</td>
                <td>${fullName || "Thành viên FitTrack"}</td>
                <td style="background: #f8fafc; font-weight: bold; width: 25%;">Tổng số buổi tập:</td>
                <td><strong>${userSessions.length} buổi</strong></td>
              </tr>
              <tr>
                <td style="background: #f8fafc; font-weight: bold;">Chiều cao / Cân nặng:</td>
                <td>${heightCm} cm / ${weightKg} kg</td>
                <td style="background: #f8fafc; font-weight: bold;">Tổng khối lượng tạ:</td>
                <td><strong>${totalVol.toLocaleString("vi-VN")} kg</strong></td>
              </tr>
              <tr>
                <td style="background: #f8fafc; font-weight: bold;">Chỉ số BMI:</td>
                <td colspan="3"><strong>${bmiVal}</strong> (${getBmiLabel(Number(bmiVal)).label})</td>
              </tr>
            </table>

            <h3 style="color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-top: 30px; margin-bottom: 20px; font-size: 16px;">LỊCH SỬ CÁC BUỔI TẬP CHI TIẾT</h3>
            <div>${sessionsHTML}</div>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (e: any) {
      toast({
        title: "Lỗi xuất báo cáo",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: "Vui lòng nhập họ tên", variant: "destructive" });
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // We update fields that might not exist in Supabase by catching error,
    // Note: If you haven't added gender, experience_level, fitness_goal, bio to Supabase table `profiles`,
    // you may need to add them. Assuming they were added or using JSONB metadata in the future.
    // If not, this might cause an issue on saving! Let's assume the user has run alter table for them.
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        weight_kg: weightKg || null,
        height_cm: heightCm || null,
        gender: gender || null,
        experience_level: experienceLevel || null,
        fitness_goal: fitnessGoal || null,
        bio: bio.trim() || null,
      })
      .eq("id", user!.id);

    if (error) {
      toast({
        title: "Lỗi cập nhật",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Đã cập nhật hồ sơ thành công 🚀" });
      router.refresh();
    }
    setLoading(false);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar, BMI, Actions */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <Card className="premium-glass-card border-slate-700/50 shadow-xl overflow-hidden text-center relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-rose-500 absolute top-0 left-0" />
            <CardContent className="pt-10 pb-6 flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-slate-800 shadow-xl ring-2 ring-orange-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-700 text-white text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-white text-2xl font-bold mt-4">
                {fullName || "Thành viên bí ẩn"}
              </p>
              <p className="text-orange-500 text-sm font-medium mt-1 flex items-center gap-1 justify-center">
                <Target className="h-4 w-4" />
                {fitnessGoal || "Chưa chọn mục tiêu cá nhân"}
              </p>
              
              <div className="w-full h-px bg-slate-700/50 my-6" />
              
              {bmi ? (
                <div className="w-full text-left">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-400 text-sm font-medium flex items-center gap-1.5"><Activity className="h-4 w-4"/> Chỉ số BMI</p>
                    <p className={`text-sm font-bold ${getBmiLabel(Number(bmi)).color}`}>
                      {getBmiLabel(Number(bmi)).label}
                    </p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 flex justify-between items-end border border-slate-800 shadow-inner">
                     <span className="text-3xl font-black text-white">{bmi}</span>
                     <span className="text-slate-500 text-xs font-semibold">{weightKg}kg / {heightCm}cm</span>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm text-center">Nhập chiều cao & cân nặng để tính tỉ lệ BMI</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-700 border-dashed hover:border-orange-500/50 transition-colors cursor-pointer group" onClick={handleExportReport}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Xuất PDF Báo cáo</p>
                <p className="text-slate-400 text-xxs mt-0.5">Summary mọi buổi tập luyện</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          <Card className="premium-glass-card border-slate-700/50 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-700/50 bg-slate-800/30">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>Các thông tin cơ bản giúp AI hiểu & tư vấn lộ trình luyện tập tốt hơn cho bạn.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Họ và tên *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="bg-slate-900 border-slate-700 text-white h-11 focus-visible:ring-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold">Giới tính</Label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md text-white h-11 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  >
                    <option value="">Chưa chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold">Kinh nghiệm</Label>
                  <select 
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md text-white h-11 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  >
                    <option value="">Chưa chọn</option>
                    <option value="beginner">Người mới bắt đầu (Beginner)</option>
                    <option value="intermediate">Trung bình (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                  </select>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="premium-glass-card border-slate-700/50 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-700/50 bg-slate-800/30">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-orange-500" />
                Thể trạng & Mục tiêu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold flex items-center gap-1.5"><Weight className="h-4 w-4"/> Cân nặng (kg)</Label>
                  <Input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value) || "")}
                    placeholder="VD: 70"
                    className="bg-slate-900 border-slate-700 text-white h-11 focus-visible:ring-orange-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold flex items-center gap-1.5"><Ruler className="h-4 w-4"/> Chiều cao (cm)</Label>
                  <Input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value) || "")}
                    placeholder="VD: 175"
                    className="bg-slate-900 border-slate-700 text-white h-11 focus-visible:ring-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Mục tiêu cao nhất</Label>
                <select 
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md text-white h-11 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  >
                    <option value="">Chưa chọn</option>
                    <option value="Fat Loss">Giảm mỡ</option>
                    <option value="Muscle Gain">Tăng cơ (Hypertrophy)</option>
                    <option value="Strength">Tăng sức mạnh (Strength & Power)</option>
                    <option value="Maintenance">Duy trì (Maintenance)</option>
                  </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold flex items-center gap-1.5"><ShieldQuestion className="h-4 w-4"/> Giới thiệu bản thân / Tiền sử</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="VD: Thoát vị đĩa đệm độ nhẹ, rảnh tập vào buổi chiều từ 17h..."
                  rows={3}
                  className="bg-slate-900 border-slate-700 text-white min-h-[80px] focus-visible:ring-orange-500/50 resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2 pb-10">
            <Button
              size="lg"
              disabled={loading}
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/25 px-10 transition-all active:scale-95"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Đang lưu thông tin..." : "Lưu Hồ Sơ"}
            </Button>
          </div>
        </div>
      </div>
    );
}
