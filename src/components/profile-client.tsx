"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { User, Weight, Ruler, Save, FileText } from "lucide-react";
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
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        weight_kg: weightKg || null,
        height_cm: heightCm || null,
      })
      .eq("id", user!.id);

    if (error) {
      toast({
        title: "Lỗi cập nhật",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Cập nhật thành công!" });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Avatar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-orange-500 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-xl font-semibold">
                {fullName || "Chưa đặt tên"}
              </p>
              <p className="text-slate-400 text-sm">FitTrack Member</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BMI Card */}
      {bmi && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Chỉ số BMI</p>
                <p className="text-4xl font-bold text-white mt-1">{bmi}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${getBmiLabel(Number(bmi)).color}`}
                >
                  {getBmiLabel(Number(bmi)).label}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {weightKg}kg / {heightCm}cm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export PDF Card */}
      <Card className="bg-slate-800/40 border-slate-700 border-dashed hover:border-orange-500/50 transition-colors">
        <CardContent className="pt-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Báo cáo tiến trình tập luyện
            </p>
            <p className="text-slate-400 text-xxs mt-1 leading-relaxed">
              Tổng hợp toàn bộ chỉ số BMI, khối lượng tạ tích lũy và nhật ký
              luyện tập chi tiết của bạn thành file PDF.
            </p>
          </div>
          <Button
            onClick={handleExportReport}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 text-xs font-semibold py-1.5 px-3"
          >
            Xuất PDF / In
          </Button>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Chỉnh sửa thông tin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4" /> Họ tên
            </Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Weight className="h-4 w-4" /> Cân nặng (kg)
              </Label>
              <Input
                type="number"
                min={30}
                max={200}
                step={0.1}
                placeholder="70"
                value={weightKg}
                onChange={(e) =>
                  setWeightKg(e.target.value ? parseFloat(e.target.value) : "")
                }
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Ruler className="h-4 w-4" /> Chiều cao (cm)
              </Label>
              <Input
                type="number"
                min={100}
                max={250}
                placeholder="170"
                value={heightCm}
                onChange={(e) =>
                  setHeightCm(e.target.value ? parseFloat(e.target.value) : "")
                }
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
