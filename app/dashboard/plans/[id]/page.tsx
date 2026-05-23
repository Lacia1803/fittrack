import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Play,
  Timer,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch Plan info
  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (!plan) {
    return <div className="text-white p-6">Plan không tồn tại.</div>;
  }

  // Fetch all sessions linked to this plan
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*, session_exercises(*)")
    .eq("plan_id", id)
    .order("date", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/plans">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">{plan.name}</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Tạo ngày{" "}
            {format(new Date(plan.created_at), "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          {/* Plan Info Card */}
          <Card className="premium-glass-card">
            <CardHeader>
              <CardTitle className="text-white">Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">
                {plan.description || "Chưa có mô tả chi tiết."}
              </p>

              <Link href={`/dashboard/sessions/new?planId=${plan.id}`}>
                <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 font-bold text-black shadow-lg shadow-orange-500/20 active:scale-95 transition-transform">
                  <Play className="h-4 w-4 mr-2 fill-current" /> Bắt đầu buổi
                  tập
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">
                💡 <strong>Mẹo:</strong> Việc liên kết Buổi tập vào chung một
                Workout Plan giúp bạn dễ dàng theo dõi số lần tập và sự tăng
                trưởng khối lượng tạ (Volume) trong một chương trình cụ thể.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Lịch sử buổi tập{" "}
              <span className="bg-orange-500/20 text-orange-500 text-xs px-2.5 py-0.5 rounded-full">
                {sessions?.length || 0}
              </span>
            </h2>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="grid gap-4">
              {sessions.map((session: any) => {
                const totalExercises = session.session_exercises?.length || 0;
                return (
                  <Link
                    key={session.id}
                    href={`/dashboard/sessions/${session.id}`}
                    className="block block-hover"
                  >
                    <Card className="bg-slate-800 border-slate-700 hover:border-orange-500/50 transition-colors">
                      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {session.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />{" "}
                              {format(new Date(session.date), "dd/MM/yyyy")}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Dumbbell className="h-3.5 w-3.5" />{" "}
                              {totalExercises} bài
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                        >
                          Xem
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 border-dashed rounded-xl">
              <Dumbbell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium text-lg">
                Chưa có buổi tập nào
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Bấm "Bắt đầu buổi tập" để ghi nhận buổi đầu tiên nhé.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
