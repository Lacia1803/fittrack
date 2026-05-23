'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Dumbbell, ClipboardList, Camera, TrendingUp, Sparkles, Flame, Apple, Activity, Utensils, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import VolumeProgressChart from '@/components/volume-chart'
import SeedDataButton from '@/components/seed-data-button'
import { format, subDays } from 'date-fns'

interface Exercise {
  id: string
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
  notes: string | null
}

interface Session {
  id: string
  name: string
  date: string
  session_exercises?: Exercise[]
}

interface DashboardClientProps {
  initialSessions: Session[]
  planCount: number
  sessionCount: number
  photoCount: number
  profile: any
}

export default function DashboardClient({
  initialSessions,
  planCount,
  sessionCount,
  photoCount,
  profile
}: DashboardClientProps) {
  const [range, setRange] = useState<'week' | 'month' | '90days'>('week')
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 })

  // Load today's nutrition intake from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const saved = localStorage.getItem(`nutrition_${todayStr}`)
      if (saved) {
        setNutrition(JSON.parse(saved))
      }
    }
  }, [])

  // Parse exercise volume helper
  const getSessionVolume = (session: Session) => {
    return session.session_exercises?.reduce((sum, ex) => {
      if (ex.notes) {
        try {
          const parsed = JSON.parse(ex.notes)
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.setsDetail)) {
            return sum + parsed.setsDetail.reduce((sSum: number, s: any) => {
              return sSum + ((Number(s.reps) || 0) * (Number(s.weight_kg) || 0))
            }, 0)
          }
        } catch (e) {
          // Fallback
        }
      }
      return sum + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0))
    }, 0) || 0
  }

  // Filtered sessions and comparison stats based on range toggle
  const stats = useMemo(() => {
    const now = new Date()
    let days = 7
    if (range === 'month') days = 30
    if (range === '90days') days = 90

    const cutoffDate = subDays(now, days)
    const prevCutoffDate = subDays(now, days * 2)

    // Current period sessions
    const currentSessions = initialSessions.filter(s => new Date(s.date) >= cutoffDate)
    // Previous period sessions (for growth rate)
    const prevSessions = initialSessions.filter(s => {
      const d = new Date(s.date)
      return d >= prevCutoffDate && d < cutoffDate
    })

    const currentVolume = currentSessions.reduce((sum, s) => sum + getSessionVolume(s), 0)
    const prevVolume = prevSessions.reduce((sum, s) => sum + getSessionVolume(s), 0)

    let volDiffPct = 0
    if (prevVolume > 0) {
      volDiffPct = Math.round(((currentVolume - prevVolume) / prevVolume) * 100)
    } else if (currentVolume > 0) {
      volDiffPct = 100
    }

    // Target sessions based on goal/frequency (e.g. 5 for week, 20 for month, 60 for 90 days)
    const targetSessions = range === 'week' ? 5 : range === 'month' ? 20 : 60
    const compliancePct = Math.min(Math.round((currentSessions.length / targetSessions) * 100), 100)

    return {
      currentSessions,
      currentVolume,
      volDiffPct,
      compliancePct,
      sessionCount: currentSessions.length,
      targetSessions
    }
  }, [initialSessions, range])

  // Nutrition targets (match nutrition/page.tsx formula)
  const weight = profile?.weight_kg || 70
  const height = profile?.height_cm || 170
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5)
  const tdee = Math.round(bmr * 1.375) // light activity
  const targetCal = tdee
  const targetProt = Math.round((targetCal * 0.3) / 4)
  const targetCarbs = Math.round((targetCal * 0.4) / 4)
  const targetFats = Math.round((targetCal * 0.3) / 9)

  const getProgressPct = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min(Math.round((current / target) * 100), 100)
  }

  return (
    <div className="space-y-8">
      {/* Title + Range Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tổng quan hành trình</h1>
          <p className="text-slate-400 mt-1">Tuần này · {stats.sessionCount} buổi tập · Mục tiêu tăng cơ</p>
        </div>

        {/* Segmented control toggle */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10 w-fit gap-1">
          {(['week', 'month', '90days'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'week' ? 'Tuần' : r === 'month' ? 'Tháng' : '90 ngày'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Volume Card */}
        <Card className="premium-glass-card hover:border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-slate-400 text-sm font-medium">Khối lượng</span>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white font-mono">{stats.currentVolume.toLocaleString('vi-VN')} kg</p>
            <p className="text-xs text-orange-400 mt-1">
              {stats.volDiffPct >= 0 ? `+${stats.volDiffPct}%` : `${stats.volDiffPct}%`} so với kỳ trước
            </p>
          </CardContent>
        </Card>

        {/* Compliance Card */}
        <Card className="premium-glass-card hover:border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-slate-400 text-sm font-medium">Tuân thủ lịch</span>
            <Dumbbell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white font-mono">{stats.compliancePct}%</p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.sessionCount}/{stats.targetSessions} buổi hoàn thành
            </p>
          </CardContent>
        </Card>

        {/* AI Coach Card */}
        <Link href="/dashboard/coach" className="block">
          <Card className="premium-glass-card hover:border-orange-500/50 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-slate-400 text-sm font-medium">AI Coach</span>
              <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">3 nhắc nhở</p>
              <p className="text-xs text-orange-400 mt-1">Tempo + cân bằng cơ lưng</p>
            </CardContent>
          </Card>
        </Link>

        {/* Macros Card */}
        <Link href="/dashboard/nutrition" className="block">
          <Card className="premium-glass-card hover:border-orange-500/50 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-slate-400 text-sm font-medium">Macro hôm nay</span>
              <Apple className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-white font-mono">
                P{nutrition.protein} C{nutrition.carbs} F{nutrition.fats}
              </p>
              <p className="text-xs text-slate-400 mt-1.5">
                {nutrition.calories} / {targetCal} kcal đã ăn
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Grid: Chart + Nutrition Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Volume Progress Recharts */}
        <Card className="premium-glass-card lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-white text-md font-semibold">Biểu đồ khối lượng & tăng trưởng tạ</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Vẽ tiến trình tập luyện theo bộ lọc thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeProgressChart sessions={stats.currentSessions} />
          </CardContent>
        </Card>

        {/* Right Column: Nutrition Calculator Progress Bars */}
        <Card className="premium-glass-card lg:col-span-4 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-white text-md font-semibold">Nutrition calculator</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Theo dõi chất dinh dưỡng vi lượng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Protein */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Protein (Đạm)</span>
                <span className="text-white font-bold font-mono">{nutrition.protein}g / {targetProt}g</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPct(nutrition.protein, targetProt)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Carbohydrate (Tinh bột)</span>
                <span className="text-white font-bold font-mono">{nutrition.carbs}g / {targetCarbs}g</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPct(nutrition.carbs, targetCarbs)}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Lipid (Chất béo)</span>
                <span className="text-white font-bold font-mono">{nutrition.fats}g / {targetFats}g</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPct(nutrition.fats, targetFats)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link href="/dashboard/nutrition">
                <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-600 font-semibold text-xs">
                  Cập nhật nhật ký dinh dưỡng →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Sessions List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-white font-semibold text-sm">Hành động nhanh</h3>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/sessions/new">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-5 rounded-xl shadow-lg shadow-orange-500/10">
                <Dumbbell className="h-4 w-4 mr-2" />
                Ghi buổi tập mới
              </Button>
            </Link>
            <Link href="/dashboard/plans/new">
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300 py-5 rounded-xl">
                <ClipboardList className="h-4 w-4 mr-2" />
                Thiết lập giáo án mới
              </Button>
            </Link>
            <SeedDataButton />
          </div>
        </div>

        {/* Recent Sessions List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-white font-semibold text-sm">Lịch sử buổi tập</h3>
          
          <div className="space-y-3">
            {stats.currentSessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <p className="text-slate-500 text-xs sm:text-sm">Chưa có buổi tập nào được ghi nhận trong khoảng thời gian này.</p>
              </div>
            ) : (
              stats.currentSessions.slice(0, 4).map((s) => {
                const vol = getSessionVolume(s)
                return (
                  <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between hover:border-orange-500/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-500">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-white text-xs sm:text-sm font-semibold">{s.name}</h4>
                        <span className="text-slate-500 text-[10px] sm:text-xs font-mono">{format(new Date(s.date), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-xs sm:text-sm font-bold font-mono">{vol.toLocaleString('vi-VN')} kg</span>
                      <span className="text-[10px] text-orange-500 block font-medium mt-0.5">+4.2% volume</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
