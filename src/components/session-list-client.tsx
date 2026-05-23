"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dumbbell,
  Calendar,
  FileText,
  Trash2,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SessionListClient({
  initialSessions,
}: {
  initialSessions: any[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `Bạn có chắc muốn xóa ${selectedIds.size} buổi tập đã chọn? Hành động này không thể hoàn tác.`,
      )
    )
      return;

    setLoading(true);
    const { error } = await supabase
      .from("workout_sessions")
      .delete()
      .in("id", Array.from(selectedIds));

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa các buổi tập đã chọn.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Thành công",
        description: `Đã xóa ${selectedIds.size} buổi tập.`,
      });
      setSessions((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {sessions.length > 0 && (
        <div className="flex items-center justify-between bg-slate-800/50 p-3 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectedIds.size === sessions.length
                ? "Bỏ chọn tất cả"
                : "Chọn tất cả"}
            </Button>
            <span className="text-sm text-slate-400">
              Đã chọn:{" "}
              <strong className="text-white">{selectedIds.size}</strong>
            </span>
          </div>

          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white text-xs"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Đang xóa..." : "Xóa mục đã chọn"}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={`border transition-colors ${
              selectedIds.has(session.id)
                ? "bg-orange-500/10 border-orange-500/50"
                : "bg-slate-800 border-slate-700 hover:border-orange-500/30"
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(session.id)}
                  onChange={() => toggleSelect(session.id)}
                  className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800"
                />
                <div
                  onClick={() => toggleSelect(session.id)}
                  className="cursor-pointer flex items-center gap-3"
                >
                  <div className="bg-orange-500/10 p-2 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      {session.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.date), "EEEE, dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/dashboard/sessions/${session.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  Chi tiết
                </Button>
              </Link>
            </CardHeader>
            <CardContent
              className="px-4 pb-4 pt-0 text-sm text-slate-400"
              onClick={() => toggleSelect(session.id)}
            >
              <div className="flex items-center gap-4 ml-[68px]">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {session.session_exercises
                    ? session.session_exercises.length
                    : 0}{" "}
                  bài tập
                </span>
                {session.notes && (
                  <span className="truncate max-w-[200px] sm:max-w-xs">
                    {session.notes}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
