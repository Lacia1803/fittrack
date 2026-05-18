'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Trash2, Play, Pause, RotateCcw, Timer } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { WorkoutPlan } from '@/lib/types'
import { format } from 'date-fns'

interface SetDetail {
  reps: number | ''
  weight_kg: number | ''
}

interface ExerciseInput {
  exercise_name: string
  sets: number
  reps: number | ''
  weight_kg: number | ''
  notes: string
  sets_detail: SetDetail[]
}

const emptyExercise = (): ExerciseInput => ({
  exercise_name: '',
  sets: 3,
  reps: 10,
  weight_kg: '',
  notes: '',
  sets_detail: [
    { reps: 10, weight_kg: '' },
    { reps: 10, weight_kg: '' },
    { reps: 10, weight_kg: '' },
  ]
})

function RestTimer() {
  const [time, setTime] = useState(90) // default 90s
  const [isActive, setIsActive] = useState(false)
  const [initialTime, setInitialTime] = useState(90)

  useEffect(() => {
    let interval: any = null
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((t) => t - 1)
      }, 1000)
    } else if (time === 0) {
      setIsActive(false)
      if (typeof window !== 'undefined') {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass()
            const oscillator = audioCtx.createOscillator()
            const gainNode = audioCtx.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioCtx.destination)
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
            oscillator.start()
            oscillator.stop(audioCtx.currentTime + 0.3)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }

    // Play crisp 3-2-1 countdown ticking sound before the rest period ends
    if (isActive && time > 0 && time <= 3) {
      if (typeof window !== 'undefined') {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass()
            const oscillator = audioCtx.createOscillator()
            const gainNode = audioCtx.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioCtx.destination)
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime) // short tick
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
            oscillator.start()
            oscillator.stop(audioCtx.currentTime + 0.05)
          }
        } catch (e) {
          console.warn(e)
        }
      }
    }

    return () => clearInterval(interval)
  }, [isActive, time])

  const toggle = () => setIsActive(!isActive)
  
  const reset = () => {
    setTime(initialTime)
    setIsActive(false)
  }

  const setTimerPreset = (seconds: number) => {
    setInitialTime(seconds)
    setTime(seconds)
    setIsActive(false)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500 animate-pulse">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block font-medium">Đồng hồ nghỉ giữa hiệp</span>
            <span className="text-2xl font-bold text-white font-mono">{formatTime(time)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button onClick={() => setTimerPreset(60)} size="sm" variant="ghost" className="h-8 px-2 text-xs text-slate-400 hover:text-white">60s</Button>
          <Button onClick={() => setTimerPreset(90)} size="sm" variant="ghost" className="h-8 px-2 text-xs text-slate-400 hover:text-white">90s</Button>
          <Button onClick={() => setTimerPreset(120)} size="sm" variant="ghost" className="h-8 px-2 text-xs text-slate-400 hover:text-white">2m</Button>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <Button onClick={toggle} size="icon" className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-transform active:scale-90">
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={reset} size="icon" variant="outline" className="h-8 w-8 border-slate-700 text-slate-400 hover:text-white rounded-full transition-transform active:scale-90">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NewSessionPage() {
  const [name, setName] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [planId, setPlanId] = useState('')
  const [exercises, setExercises] = useState<ExerciseInput[]>([emptyExercise()])
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user!.id)
      setPlans(data || [])
    }
    fetchPlans()
  }, [])

  const updateExercise = (index: number, field: keyof ExerciseInput, value: any) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== index) return ex

      if (field === 'sets') {
        const newSets = parseInt(value) || 1
        const currentDetails = ex.sets_detail || []
        const newDetails = Array.from({ length: newSets }, (_, sIdx) => {
          return currentDetails[sIdx] || { reps: ex.reps || 10, weight_kg: ex.weight_kg || '' }
        })
        return { ...ex, sets: newSets, sets_detail: newDetails }
      }

      return { ...ex, [field]: value }
    }))
  }

  const updateSetDetail = (exIndex: number, setIndex: number, field: keyof SetDetail, value: any) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex
      const newDetails = ex.sets_detail.map((set, sIdx) => {
        if (sIdx !== setIndex) return set
        return { ...set, [field]: value }
      })
      // Sync reps & weight of first set to top level flat properties for compatibility
      const firstSet = newDetails[0]
      return {
        ...ex,
        sets_detail: newDetails,
        reps: firstSet ? firstSet.reps : ex.reps,
        weight_kg: firstSet ? firstSet.weight_kg : ex.weight_kg
      }
    }))
  }

  const copyFirstSetToAll = (exIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex
      const firstSet = ex.sets_detail[0]
      if (!firstSet) return ex
      const newDetails = ex.sets_detail.map(() => ({
        reps: firstSet.reps,
        weight_kg: firstSet.weight_kg
      }))
      return { ...ex, sets_detail: newDetails, reps: firstSet.reps, weight_kg: firstSet.weight_kg }
    }))
    toast({ title: 'Đã sao chép Hiệp 1 cho các hiệp còn lại!' })
  }

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const serializeExerciseNotes = (e: ExerciseInput) => {
    // Lưu thông tin chi tiết từng hiệp dạng JSON trong notes
    return JSON.stringify({
      setsDetail: e.sets_detail,
      userNotes: e.notes.trim()
    })
  }

  const saveOffline = (validExercises: ExerciseInput[]) => {
    const offlineSession = {
      name: name.trim(),
      date,
      notes: notes.trim() || null,
      plan_id: planId || null,
      exercises: validExercises.map(e => ({
        exercise_name: e.exercise_name.trim(),
        sets: e.sets,
        reps: e.reps || null,
        weight_kg: e.weight_kg || null,
        notes: serializeExerciseNotes(e),
      }))
    }
    const pending = JSON.parse(localStorage.getItem('pending_sessions') || '[]')
    pending.push(offlineSession)
    localStorage.setItem('pending_sessions', JSON.stringify(pending))
    
    toast({
      title: 'Đã lưu ngoại tuyến! 📴',
      description: 'Không có kết nối mạng. Buổi tập đã được lưu cục bộ và sẽ tự động đồng bộ khi có Internet!',
    })
    router.push('/dashboard/sessions')
    router.refresh()
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Vui lòng nhập tên buổi tập', variant: 'destructive' })
      return
    }
    const validExercises = exercises.filter(e => e.exercise_name.trim())
    if (validExercises.length === 0) {
      toast({ title: 'Thêm ít nhất 1 bài tập', variant: 'destructive' })
      return
    }

    setLoading(true)

    if (typeof window !== 'undefined' && !navigator.onLine) {
      saveOffline(validExercises)
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          name: name.trim(),
          date,
          notes: notes.trim() || null,
          plan_id: planId || null,
          user_id: user.id,
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      const { error: exerciseError } = await supabase.from('session_exercises').insert(
        validExercises.map(e => ({
          session_id: session.id,
          exercise_name: e.exercise_name.trim(),
          sets: e.sets,
          reps: e.reps || null,
          weight_kg: e.weight_kg || null,
          notes: serializeExerciseNotes(e),
        }))
      )

      if (exerciseError) throw exerciseError

      toast({ title: 'Log buổi tập thành công! 💪' })
      router.push('/dashboard/sessions')
      router.refresh()
    } catch (error: any) {
      console.warn("⚠️ Không thể kết nối Supabase, chuyển sang chế độ lưu ngoại tuyến...", error)
      saveOffline(validExercises)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/sessions">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Log Buổi Tập</h1>
      </div>

      <RestTimer />

      {/* Session Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Thông tin buổi tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Tên buổi tập *</Label>
              <Input
                placeholder="VD: Push Day, Chest & Triceps..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Ngày</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          {plans.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300">Workout Plan (tuỳ chọn)</Label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="">-- Không chọn --</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-300">Ghi chú</Label>
            <Textarea
              placeholder="Cảm giác hôm nay, năng lượng, chấn thương..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercises list */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Bài tập</CardTitle>
          <Button
            onClick={() => setExercises(prev => [...prev, emptyExercise()])}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm bài
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {exercises.map((ex, index) => (
            <div key={index} className="bg-slate-700/40 border border-slate-700/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Bài {index + 1}</span>
                {exercises.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(index)}
                    className="h-7 w-7 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">Tên bài tập</Label>
                  <Input
                    placeholder="VD: Bench Press, Pull-up..."
                    value={ex.exercise_name}
                    onChange={(e) => updateExercise(index, 'exercise_name', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">Số hiệp (Sets)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={ex.sets}
                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
              </div>

              {/* Grid detail per set */}
              <div className="space-y-2 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Chi tiết từng hiệp</span>
                  <button
                    type="button"
                    onClick={() => copyFirstSetToAll(index)}
                    className="text-[10px] text-orange-400 hover:underline hover:text-orange-300 font-medium"
                  >
                    Sao chép Hiệp 1 cho các hiệp còn lại ⚡
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ex.sets_detail.map((set, sIdx) => (
                    <div key={sIdx} className="bg-slate-900/40 rounded-lg p-2 flex items-center justify-between gap-3 border border-slate-800/30">
                      <span className="text-slate-500 text-xs font-bold font-mono">Set {sIdx + 1}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => updateSetDetail(index, sIdx, 'reps', e.target.value ? parseInt(e.target.value) : '')}
                          className="bg-slate-800 border-slate-700 text-white text-xs h-8 w-16 text-center font-mono placeholder:text-slate-600"
                        />
                        <span className="text-slate-600 text-xxs">reps</span>
                        <Input
                          type="number"
                          placeholder="Tạ"
                          step={0.5}
                          value={set.weight_kg}
                          onChange={(e) => updateSetDetail(index, sIdx, 'weight_kg', e.target.value ? parseFloat(e.target.value) : '')}
                          className="bg-slate-800 border-slate-700 text-white text-xs h-8 w-18 text-center font-mono placeholder:text-slate-600"
                        />
                        <span className="text-slate-600 text-xxs">kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional individual exercise notes */}
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Ghi chú bài tập</Label>
                <Input
                  placeholder="Cảm nhận bài tập..."
                  value={ex.notes}
                  onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white text-xs placeholder:text-slate-400"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
        >
          {loading ? 'Đang lưu...' : '💪 Lưu buổi tập'}
        </Button>
        <Link href="/dashboard/sessions">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Hủy
          </Button>
        </Link>
      </div>
    </div>
  )
}