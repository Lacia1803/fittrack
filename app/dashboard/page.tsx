import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, ClipboardList, Camera, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DashboardChart from '@/components/dashboard-chart'
import VolumeProgressChart from '@/components/volume-chart'
import SeedDataButton from '@/components/seed-data-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: planCount }, { count: sessionCount }, { count: photoCount }, { data: recentSessions }] =
    await Promise.all([
      supabase.from('workout_plans').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('progress_photos').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('workout_sessions')
        .select('id, date, name, session_exercises(id, exercise_name, sets, reps, weight_kg, notes)')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(30),
    ])

  const stats = [
    { label: 'Workout Plans', value: planCount || 0, icon: ClipboardList, href: '/dashboard/plans' },
    { label: 'Buổi tập', value: sessionCount || 0, icon: Dumbbell, href: '/dashboard/sessions' },
    { label: 'Progress Photos', value: photoCount || 0, icon: Camera, href: '/dashboard/progress' },
    { label: 'Tuần này', value: recentSessions?.filter(s => {
      const d = new Date(s.date)
      const now = new Date()
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      return d >= weekAgo
    }).length || 0, icon: TrendingUp, href: '/dashboard/sessions' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Tổng quan hành trình fitness của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-slate-400 text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workout Frequency */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-md">Tần suất tập luyện (7 ngày qua)</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart sessions={recentSessions || []} />
          </CardContent>
        </Card>

        {/* Volume & Overload Progress */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-md">Biểu đồ Tăng Tiến Sức Mạnh (Volume & Overload)</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeProgressChart sessions={recentSessions || []} />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard/sessions/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Dumbbell className="h-4 w-4 mr-2" />
            Log buổi tập mới
          </Button>
        </Link>
        <Link href="/dashboard/plans/new">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tạo workout plan
          </Button>
        </Link>
        <SeedDataButton />
      </div>
    </div>
  )
}