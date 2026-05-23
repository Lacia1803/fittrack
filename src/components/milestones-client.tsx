'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Dumbbell, Camera, Zap, Flame, Crown, Medal, Target, CalendarDays, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Milestone {
  label: string
  target: number
  current: number
  icon: React.ElementType
  color: string
}

export default function MilestonesClient({
  userId,
  initialSessionCount,
  initialPhotoCount,
  initialPlanCount,
}: {
  userId: string
  initialSessionCount: number
  initialPhotoCount: number
  initialPlanCount: number
}) {
  const [sessionCount, setSessionCount] = useState(initialSessionCount)
  const [photoCount, setPhotoCount] = useState(initialPhotoCount)
  const [planCount, setPlanCount] = useState(initialPlanCount)
  const { toast } = useToast()
  const supabase = createClient()

  // ===================================================================
  // Real-time Event Subscription for Milestones Tracking & Toast Alerts
  // ===================================================================
  // Listens to insert changes on Supabase Postgres tables workout_sessions 
  // and progress_photos. Automatically fires celebratory toast achievements.
  useEffect(() => {
    // Realtime subscription cho workout_sessions
    const channel = supabase
      .channel('milestones-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workout_sessions', filter: `user_id=eq.${userId}` },
        (payload) => {
          setSessionCount((prev) => {
            const next = prev + 1
            const milestones = [1, 5, 10, 20, 50, 100, 200, 365, 500, 1000]
            if (milestones.includes(next)) {
              toast({
                title: `🏆 Milestone đạt được!`,
                description: `Bạn đã hoàn thành ${next} buổi tập!`,
              })
            }
            return next
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'progress_photos', filter: `user_id=eq.${userId}` },
        (payload) => {
          setPhotoCount((prev) => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workout_plans', filter: `user_id=eq.${userId}` },
        (payload) => {
          setPlanCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const milestones: Milestone[] = [
    // Workout Sessions
    { label: 'Buổi tập đầu tiên', target: 1, current: sessionCount, icon: Dumbbell, color: 'text-zinc-400' },
    { label: 'Khởi động (5 buổi)', target: 5, current: sessionCount, icon: Zap, color: 'text-orange-400' },
    { label: 'Vào guồng (10 buổi)', target: 10, current: sessionCount, icon: Flame, color: 'text-orange-500' },
    { label: 'Kiên trì (20 buổi)', target: 20, current: sessionCount, icon: Target, color: 'text-rose-500' },
    { label: 'Thói quen (50 buổi)', target: 50, current: sessionCount, icon: Medal, color: 'text-yellow-400' },
    { label: 'Thợ săn tạ (100 buổi)', target: 100, current: sessionCount, icon: Trophy, color: 'text-yellow-500' },
    { label: 'Sát thủ phòng gym (200 buổi)', target: 200, current: sessionCount, icon: Crown, color: 'text-purple-500' },
    { label: 'Kỷ luật thép (1 năm / 365 buổi)', target: 365, current: sessionCount, icon: Crown, color: 'text-purple-600' },
    { label: 'Lão làng (500 buổi)', target: 500, current: sessionCount, icon: Activity, color: 'text-red-500' },

    // Workout Plans
    { label: 'Lên kế hoạch đầu tiên', target: 1, current: planCount, icon: CalendarDays, color: 'text-blue-400' },
    { label: 'Chiến lược gia (5 plans)', target: 5, current: planCount, icon: CalendarDays, color: 'text-blue-500' },
    { label: 'Huấn luyện viên (10 plans)', target: 10, current: planCount, icon: CalendarDays, color: 'text-indigo-500' },

    // Progress Photos
    { label: 'Ghi nhận bắt đầu (Ảnh 1)', target: 1, current: photoCount, icon: Camera, color: 'text-teal-400' },
    { label: 'Dấu hiệu thay đổi (5 ảnh)', target: 5, current: photoCount, icon: Camera, color: 'text-teal-500' },
    { label: 'Hành trình lột xác (10 ảnh)', target: 10, current: photoCount, icon: Camera, color: 'text-emerald-500' },
    { label: 'Minh chứng rõ rệt (20 ảnh)', target: 20, current: photoCount, icon: Camera, color: 'text-cyan-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {milestones.map((m) => {
        const achieved = m.current >= m.target
        const progress = Math.min((m.current / m.target) * 100, 100)
        return (
          <Card
            key={m.label}
            className={cn(
              'bg-slate-800 border-slate-700 transition-all',
              achieved && 'border-orange-500 bg-orange-500/5'
            )}
          >
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <m.icon className={cn('h-5 w-5', achieved ? m.color : 'text-slate-500')} />
                  <span className={cn('font-medium text-sm', achieved ? 'text-white' : 'text-slate-400')}>
                    {m.label}
                  </span>
                </div>
                {achieved && <span className="text-lg">✅</span>}
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full transition-all', achieved ? 'bg-orange-500' : 'bg-slate-500')}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs text-right">
                {m.current}/{m.target}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}