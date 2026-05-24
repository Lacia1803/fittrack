"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dumbbell, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import PlanListClient from "@/components/plan-list-client";
import SessionListClient from "@/components/session-list-client";
import { cn } from "@/lib/utils";

export default function WorkoutsClient({
  plans,
  sessions,
  defaultTab,
}: {
  plans: any[];
  sessions: any[];
  defaultTab: string;
}) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tập Luyện</h1>
          <p className="text-slate-400 mt-1">
            Quản lý chương trình và lịch sử tập luyện
          </p>
        </div>
        <div className="flex gap-2">
          {tab === "plans" ? (
            <Link href="/dashboard/plans/new">
              <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                <Plus className="h-4 w-4 mr-2" />
                Tạo Plan
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/sessions/new">
              <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                <Plus className="h-4 w-4 mr-2" />
                Log Buổi Tập
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit mb-6">
        <button
          onClick={() => setTab("sessions")}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            tab === "sessions"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-white",
          )}
        >
          <Dumbbell className="h-4 w-4" />
          Lịch sử tập
        </button>
        <button
          onClick={() => setTab("plans")}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            tab === "plans"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-white",
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Giáo án (Plans)
        </button>
      </div>

      {tab === "plans" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {plans && plans.length > 0 ? (
            <PlanListClient initialPlans={plans} />
          ) : (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 outline-dashed outline-1 outline-white/10 rounded-2xl">
              <ClipboardList className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 text-lg font-medium">
                Chưa có giáo án nào
              </p>
              <p className="text-slate-500 text-sm mt-1 mb-6">
                Tạo giáo án đầu tiên để cấu trúc các buổi tập của bạn tốt hơn
              </p>
              <Link href="/dashboard/plans/new">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Giáo án ngay
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {tab === "sessions" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {sessions && sessions.length > 0 ? (
            <SessionListClient initialSessions={sessions} />
          ) : (
            <div className="text-center py-20 bg-white/[0.02] border border-white/10 outline-dashed outline-1 outline-white/10 rounded-2xl">
              <Dumbbell className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 text-lg font-medium">
                Chưa có buổi tập nào được ghi lại
              </p>
              <p className="text-slate-500 text-sm mt-1 mb-6">
                Hãy bắt đầu đổ mồ hôi và log lại buổi tập đầu tiên của bạn
              </p>
              <Link href="/dashboard/sessions/new">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Buổi Tập
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
