"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dumbbell,
  LayoutDashboard,
  ClipboardList,
  Camera,
  LogOut,
  User,
  Trophy,
  Brain,
  Apple,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/workouts", label: "Tập Luyện", icon: Dumbbell },
  { href: "/dashboard/nutrition", label: "Dinh dưỡng", icon: Apple },
  { href: "/dashboard/coach", label: "Coach AI 🪄", icon: Brain },
  { href: "/dashboard/progress", label: "Progress Photos", icon: Camera },
  { href: "/dashboard/milestones", label: "Milestones", icon: Trophy },
  { href: "/dashboard/profile", label: "Hồ sơ", icon: User },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isLight, setIsLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load saved theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-theme");
        setIsLight(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      if (document.documentElement.classList.contains("light-theme")) {
        document.documentElement.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        setIsLight(false);
      } else {
        document.documentElement.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        setIsLight(true);
      }
    }
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Offline sync
  useEffect(() => {
    const syncSessions = async () => {
      if (typeof window === "undefined" || !navigator.onLine) return;

      const pendingStr = localStorage.getItem("pending_sessions");
      if (!pendingStr) return;

      try {
        const pending = JSON.parse(pendingStr);
        if (pending.length === 0) return;

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        console.log("🔄 Đang đồng bộ hóa dữ liệu tập luyện ngoại tuyến...");

        for (const session of pending) {
          const { data: insertedSession, error: sError } = await supabase
            .from("workout_sessions")
            .insert({
              name: session.name,
              date: session.date,
              notes: session.notes,
              plan_id: session.plan_id,
              user_id: user.id,
            })
            .select()
            .single();

          if (sError) throw sError;

          if (session.exercises && session.exercises.length > 0) {
            const { error: eError } = await supabase
              .from("session_exercises")
              .insert(
                session.exercises.map((e: any) => ({
                  session_id: insertedSession.id,
                  exercise_name: e.exercise_name,
                  sets: e.sets,
                  reps: e.reps,
                  weight_kg: e.weight_kg,
                  notes: e.notes,
                })),
              );
            if (eError) throw eError;
          }
        }

        localStorage.removeItem("pending_sessions");
        console.log("✅ Đồng bộ hóa thành công!");
        router.refresh();
      } catch (err) {
        console.error("❌ Lỗi khi đồng bộ ngoại tuyến:", err);
      }
    };

    syncSessions();
    window.addEventListener("online", syncSessions);
    return () => window.removeEventListener("online", syncSessions);
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase() || "U";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-orange-500" />
          <span className="text-xl font-bold text-white">FitTrack</span>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-orange-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.full_name || "User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    isOnline
                      ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                  )}
                />
                <span className="text-[10px] text-slate-400 font-medium">
                  {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-slate-400 hover:text-orange-500 hover:bg-slate-800/40 shrink-0"
          >
            {isLight ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-orange-500" />
          <span className="text-lg font-bold text-white">FitTrack</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-md flex flex-col z-50 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
