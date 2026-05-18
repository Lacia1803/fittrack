'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Dumbbell, Camera, Zap } from 'lucide-react'
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
}: {
  userId: string
  initialSessionCount: number
  initialPhotoCount: number
}) {
  const [sessionCount, setSessionCount] = useState(initialSessionCount)
  const [photoCount, setPhotoCount] = useState(initialPhotoCount)
  const { toast } = useToast()
  const supabase = createClient()

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
            const milestones = [1, 5, 10, 20, 50, 100]
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
        () => {
          setPhotoCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const milestones: Milestone[] = [
    { label: 'Buổi tập đầu tiên', target: 1, current: sessionCount, icon: Dumbbell, color: 'text-orange-500' },
    { label: '5 buổi tập', target: 5, current: sessionCount, icon: Dumbbell, color: 'text-orange-500' },
    { label: '10 buổi tập', target: 10, current: sessionCount, icon: Dumbbell, color: 'text-orange-500' },
    { label: '20 buổi tập', target: 20, current: sessionCount, icon: Trophy, color: 'text-yellow-500' },
    { label: '50 buổi tập', target: 50, current: sessionCount, icon: Trophy, color: 'text-yellow-500' },
    { label: '100 buổi tập', target: 100, current: sessionCount, icon: Zap, color: 'text-purple-500' },
    { label: 'Ảnh đầu tiên', target: 1, current: photoCount, icon: Camera, color: 'text-blue-500' },
    { label: '5 progress photos', target: 5, current: photoCount, icon: Camera, color: 'text-blue-500' },
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