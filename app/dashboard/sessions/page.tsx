import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus } from "lucide-react";
import Link from "next/link";
import SessionListClient from "@/components/session-list-client";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*, session_exercises(*)")
    .eq("user_id", user!.id)
    .order("date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Buổi tập</h1>
          <p className="text-slate-400 mt-1">Lịch sử tập luyện của bạn</p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Log buổi tập
          </Button>
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <SessionListClient initialSessions={sessions} />
      ) : (
        <div className="text-center py-20 bg-slate-800/20 border border-slate-700/50 outline-dashed outline-1 outline-slate-700 rounded-xl">
          <Dumbbell className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Chưa có buổi tập nào</p>
          <p className="text-slate-500 text-sm mt-1">
            Bắt đầu log buổi tập đầu tiên
          </p>
          <Link href="/dashboard/sessions/new">
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Log ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
