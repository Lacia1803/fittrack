'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { subDays, format } from 'date-fns'

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // ===================================================================
  // 1-Click Database Seeding Flow
  // ===================================================================
  // Pre-populates all necessary Postgres tables (workout_plans, workout_sessions,
  // session_exercises, milestones, progress_photos) with 7 days of structured 
  // fitness history for instantaneous presentation and verification.
  const handleSeed = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: 'Vui lòng đăng nhập trước', variant: 'destructive' })
        setLoading(false)
        return
      }

      console.log('🌱 Bắt đầu tạo dữ liệu mẫu cho user:', user.id)

      // 1. Tạo Workout Plans mẫu
      const planTemplates = [
        { name: 'Push Day (Ngực, Vai, Tay sau)', user_id: user.id },
        { name: 'Pull Day (Lưng, Xô, Tay trước)', user_id: user.id },
        { name: 'Leg Day (Chân, Mông, Bắp chân)', user_id: user.id },
      ]

      const { data: plans, error: planError } = await supabase
        .from('workout_plans')
        .insert(planTemplates)
        .select()

      if (planError) throw planError
      const pushPlan = plans?.find(p => p.name.startsWith('Push'))
      const pullPlan = plans?.find(p => p.name.startsWith('Pull'))
      const legPlan = plans?.find(p => p.name.startsWith('Leg'))

      // 2. Tạo các workout sessions trong 7 ngày qua
      const today = new Date()

      // Buổi 1: Chân (5 ngày trước)
      const { data: s1, error: e1 } = await supabase
        .from('workout_sessions')
        .insert({
          name: 'Leg Day tập trung Đùi trước',
          date: format(subDays(today, 5), 'yyyy-MM-dd'),
          notes: 'Năng lượng tốt, squat lên form vững chãi.',
          plan_id: legPlan?.id || null,
          user_id: user.id
        })
        .select().single()
      if (e1) throw e1

      await supabase.from('session_exercises').insert([
        { session_id: s1.id, exercise_name: 'Back Squat (Gánh đùi)', sets: 4, reps: 8, weight_kg: 80, notes: 'Hiệp cuối hơi mệt' },
        { session_id: s1.id, exercise_name: 'Romanian Deadlift', sets: 3, reps: 10, weight_kg: 60, notes: 'Giữ lưng thẳng cực tốt' },
        { session_id: s1.id, exercise_name: 'Leg Press (Đạp đùi)', sets: 3, reps: 12, weight_kg: 120, notes: 'Pump đùi trước tối đa' }
      ])

      // Buổi 2: Push Day (3 ngày trước)
      const { data: s2, error: e2 } = await supabase
        .from('workout_sessions')
        .insert({
          name: 'Push Day nâng mức tạ Bench Press',
          date: format(subDays(today, 3), 'yyyy-MM-dd'),
          notes: 'Đã đẩy được 75kg thành công!',
          plan_id: pushPlan?.id || null,
          user_id: user.id
        })
        .select().single()
      if (e2) throw e2

      await supabase.from('session_exercises').insert([
        { session_id: s2.id, exercise_name: 'Flat Bench Press', sets: 4, reps: 6, weight_kg: 75, notes: 'New PR! Đẩy rất mượt' },
        { session_id: s2.id, exercise_name: 'Dumbbell Shoulder Press', sets: 3, reps: 8, weight_kg: 20, notes: 'Tay vai khỏe' },
        { session_id: s2.id, exercise_name: 'Tricep Pushdown', sets: 3, reps: 12, weight_kg: 25, notes: 'Siết bắp tay sau' }
      ])

      // Buổi 3: Pull Day (Hôm qua)
      const { data: s3, error: e3 } = await supabase
        .from('workout_sessions')
        .insert({
          name: 'Pull Day kéo xô dày lưng',
          date: format(subDays(today, 1), 'yyyy-MM-dd'),
          notes: 'Cảm nhận cơ lưng xô (mind-muscle connection) rất tốt.',
          plan_id: pullPlan?.id || null,
          user_id: user.id
        })
        .select().single()
      if (e3) throw e3

      await supabase.from('session_exercises').insert([
        { session_id: s3.id, exercise_name: 'Barbell Row (Gập người chèo tạ)', sets: 4, reps: 8, weight_kg: 50, notes: 'Tập trung kéo cùi chỏ về sau' },
        { session_id: s3.id, exercise_name: 'Lat Pulldown (Kéo xô máy)', sets: 3, reps: 10, weight_kg: 45, notes: 'Căng xô tối đa ở đỉnh' },
        { session_id: s3.id, exercise_name: 'Bicep Curl (Cuốn tạ đơn)', sets: 3, reps: 12, weight_kg: 12, notes: 'Bơm căng tay trước' }
      ])

      // 3. Tạo Milestones mẫu
      const milestones = [
        { title: 'Buổi tập đầu tiên', description: 'Log thành công buổi tập đầu tiên trên FitTrack!', is_achieved: true, achieved_at: format(subDays(today, 5), 'yyyy-MM-dd'), user_id: user.id },
        { title: 'Chinh phục Bench Press 75kg', description: 'Đẩy ngực ngang thành công với mức tạ 75kg!', is_achieved: true, achieved_at: format(subDays(today, 3), 'yyyy-MM-dd'), user_id: user.id },
        { title: 'Kỷ luật Thép', description: 'Hoàn thành 3 buổi tập trong 1 tuần.', is_achieved: true, achieved_at: format(subDays(today, 1), 'yyyy-MM-dd'), user_id: user.id },
        { title: 'Mục tiêu Bench Press 100kg', description: 'Đẩy ngực ngang mức tạ 100kg.', is_achieved: false, user_id: user.id },
      ]
      await supabase.from('milestones').insert(milestones)

      // 4. Tạo ảnh tiến trình mẫu (ảnh minh họa public)
      const progressPhotos = [
        { photo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', caption: 'Ngày bắt đầu FitTrack - Cân nặng 72kg', taken_at: format(subDays(today, 5), 'yyyy-MM-dd'), user_id: user.id },
        { photo_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', caption: 'Sau 5 ngày tập luyện hăng say', taken_at: format(today, 'yyyy-MM-dd'), user_id: user.id },
      ]
      await supabase.from('progress_photos').insert(progressPhotos)

      toast({
        title: 'Tạo dữ liệu mẫu thành công! 🎉',
        description: '3 plans, 3 buổi tập lịch sử, 4 cột mốc và 2 ảnh tiến trình đã được thiết lập.',
      })
      
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Lỗi tạo dữ liệu mẫu',
        description: error.message || 'Vui lòng kiểm tra lại quyền hoặc database.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 flex items-center gap-2 active:scale-95 transition-transform"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tạo dữ liệu...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-amber-200 animate-pulse" />
          Tạo dữ liệu mẫu nhanh
        </>
      )}
    </Button>
  )
}
