'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Utensils, Flame, Apple, Activity, Plus, RotateCcw, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface DailyIntake {
  calories: number
  protein: number
  carbs: number
  fats: number
}

const emptyIntake = (): DailyIntake => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
})

export default function NutritionTrackerPage() {
  const [profile, setProfile] = useState<any>(null)
  const [todayDate, setTodayDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [intake, setIntake] = useState<DailyIntake>(emptyIntake())
  const [goal, setGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain')
  const [activity, setActivity] = useState<number>(1.375) // default Light Active

  // Meal Quick Add state
  const [mealName, setMealName] = useState('')
  const [quickCal, setQuickCal] = useState<number | ''>('')
  const [quickProt, setQuickProt] = useState<number | ''>('')
  const [quickCarbs, setQuickCarbs] = useState<number | ''>('')
  const [quickFats, setQuickFats] = useState<number | ''>('')

  const supabase = createClient()
  const { toast } = useToast()

  // Load Profile & Local Logs
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    fetchProfile()

    // Load today's intake from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nutrition_${todayDate}`)
      if (saved) {
        setIntake(JSON.parse(saved))
      } else {
        setIntake(emptyIntake())
      }
    }
  }, [todayDate])

  const saveIntake = (newIntake: DailyIntake) => {
    setIntake(newIntake)
    localStorage.setItem(`nutrition_${todayDate}`, JSON.stringify(newIntake))
  }

  // ==========================================
  // BMR & TDEE Calculations (Mifflin-St Jeor)
  // ==========================================
  // BMR (Basal Metabolic Rate): resting energy expenditure.
  // Formula: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age + s (where s is +5 for men, -161 for women)
  // TDEE (Total Daily Energy Expenditure): daily calorie burn factoring in Activity Levels.
  const weight = profile?.weight_kg || 70
  const height = profile?.height_cm || 170
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5) // assume average 25 years old
  const tdee = Math.round(bmr * activity)

  // Calorie & Macros target based on Goal:
  // - Cut: Caloric deficit (-500 kcal) for fat loss
  // - Bulk: Caloric surplus (+300 kcal) for lean muscle growth
  // - Maintain: Balanced energy intake matching TDEE
  let targetCal = tdee
  if (goal === 'cut') targetCal = tdee - 500
  if (goal === 'bulk') targetCal = tdee + 300

  // 40% Carb - 30% Protein - 30% Fat split ratio optimized for lifters and bodybuilding
  const targetProt = Math.round((targetCal * 0.3) / 4)
  const targetCarbs = Math.round((targetCal * 0.4) / 4)
  const targetFats = Math.round((targetCal * 0.3) / 9)

  const handleQuickAdd = () => {
    const c = Number(quickCal) || 0
    const p = Number(quickProt) || 0
    const carb = Number(quickCarbs) || 0
    const f = Number(quickFats) || 0

    if (c === 0 && p === 0 && carb === 0 && f === 0) {
      toast({ title: 'Vui lòng nhập tối thiểu một chỉ số', variant: 'destructive' })
      return
    }

    const updated: DailyIntake = {
      calories: intake.calories + c,
      protein: intake.protein + p,
      carbs: intake.carbs + carb,
      fats: intake.fats + f,
    }

    saveIntake(updated)
    toast({ title: mealName ? `Đã thêm bữa ăn: ${mealName}!` : 'Đã cộng chỉ số dinh dưỡng!' })
    
    // Clear form
    setMealName('')
    setQuickCal('')
    setQuickProt('')
    setQuickCarbs('')
    setQuickFats('')
  }

  const handleReset = () => {
    if (!confirm('Đặt lại toàn bộ chỉ số hôm nay về 0?')) return
    saveIntake(emptyIntake())
    toast({ title: 'Đã reset dinh dưỡng hôm nay!' })
  }

  // Calculates percentage ring progress
  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min(Math.round((current / target) * 100), 100)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dinh Dưỡng</h1>
          <p className="text-slate-400 mt-1">Ghi chép lượng Calo và dưỡng chất thiết yếu hàng ngày</p>
        </div>
        
        {/* Date Selector */}
        <Input
          type="date"
          value={todayDate}
          onChange={(e) => setTodayDate(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white w-full sm:w-48 text-sm"
        />
      </div>

      {/* Grid: 4 Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md relative overflow-hidden group">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Calories Intake</span>
              <span className="text-2xl font-bold text-white mt-1 block font-mono">
                {intake.calories} <span className="text-sm font-normal text-slate-400">/ {targetCal} kcal</span>
              </span>
              <span className="text-xs text-orange-400 mt-1 block font-medium">Đã đạt {getProgress(intake.calories, targetCal)}%</span>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500">
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Protein (Chất đạm)</span>
              <span className="text-2xl font-bold text-white mt-1 block font-mono">
                {intake.protein}g <span className="text-sm font-normal text-slate-400">/ {targetProt}g</span>
              </span>
              <span className="text-xs text-amber-400 mt-1 block font-medium">Đã đạt {getProgress(intake.protein, targetProt)}%</span>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
              <Apple className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Carbs Card */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Carbs (Tinh bột)</span>
              <span className="text-2xl font-bold text-white mt-1 block font-mono">
                {intake.carbs}g <span className="text-sm font-normal text-slate-400">/ {targetCarbs}g</span>
              </span>
              <span className="text-xs text-blue-400 mt-1 block font-medium">Đã đạt {getProgress(intake.carbs, targetCarbs)}%</span>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Fats Card */}
        <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs font-semibold block uppercase tracking-wider">Fats (Chất béo)</span>
              <span className="text-2xl font-bold text-white mt-1 block font-mono">
                {intake.fats}g <span className="text-sm font-normal text-slate-400">/ {targetFats}g</span>
              </span>
              <span className="text-xs text-purple-400 mt-1 block font-medium">Đã đạt {getProgress(intake.fats, targetFats)}%</span>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-500">
              <Utensils className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Target Calculator */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-md flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                Thiết lập Mục tiêu
              </CardTitle>
              <CardDescription className="text-slate-400">Tùy biến lượng Calo dựa trên mục tiêu tập luyện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Fitness Goal Toggle */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold block">Mục tiêu thể hình</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setGoal('cut')}
                    className={`text-xs ${goal === 'cut' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    size="sm"
                  >
                    Giảm mỡ
                  </Button>
                  <Button
                    onClick={() => setGoal('maintain')}
                    className={`text-xs ${goal === 'maintain' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    size="sm"
                  >
                    Giữ cân
                  </Button>
                  <Button
                    onClick={() => setGoal('bulk')}
                    className={`text-xs ${goal === 'bulk' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    size="sm"
                  >
                    Tăng cơ
                  </Button>
                </div>
              </div>

              {/* Activity Multiplier */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-semibold block">Tần suất tập luyện</Label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2.5 focus:ring-orange-500"
                >
                  <option value={1.2}>Ít vận động (Không tập luyện)</option>
                  <option value={1.375}>Vận động nhẹ (Tập 1 - 3 ngày/tuần)</option>
                  <option value={1.55}>Vận động vừa (Tập 3 - 5 ngày/tuần)</option>
                  <option value={1.725}>Vận động nhiều (Tập 6 - 7 ngày/tuần)</option>
                </select>
              </div>

              {/* Energy Stats Card */}
              <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trao đổi chất cơ bản (BMR)</span>
                  <span className="font-bold text-white font-mono">{bmr} kcal</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2.5">
                  <span className="text-slate-500">Lượng Calo duy trì (TDEE)</span>
                  <span className="font-bold text-orange-500 font-mono">{tdee} kcal</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2.5">
                  <span className="text-slate-500">Mục tiêu hấp thụ Calo hàng ngày</span>
                  <span className="font-bold text-white font-mono">{targetCal} kcal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Quick Log Intake Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-md flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                Ghi chép bữa ăn nhanh
              </CardTitle>
              <CardDescription className="text-slate-400">Cộng thêm calo và chất dinh dưỡng của bữa ăn vào nhật ký hàng ngày</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Tên bữa ăn (tuỳ chọn)</Label>
                <Input
                  placeholder="VD: Bữa trưa 200g Ức gà + Cơm..."
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Calories (kcal)</Label>
                  <Input
                    type="number"
                    placeholder="350"
                    value={quickCal}
                    onChange={(e) => setQuickCal(e.target.value ? parseInt(e.target.value) : '')}
                    className="bg-slate-800 border-slate-700 text-white font-mono text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={quickProt}
                    onChange={(e) => setQuickProt(e.target.value ? parseInt(e.target.value) : '')}
                    className="bg-slate-800 border-slate-700 text-white font-mono text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="45"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(e.target.value ? parseInt(e.target.value) : '')}
                    className="bg-slate-800 border-slate-700 text-white font-mono text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Fats (g)</Label>
                  <Input
                    type="number"
                    placeholder="8"
                    value={quickFats}
                    onChange={(e) => setQuickFats(e.target.value ? parseInt(e.target.value) : '')}
                    className="bg-slate-800 border-slate-700 text-white font-mono text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleQuickAdd}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm active:scale-95 transition-transform"
                >
                  <Plus className="h-4 w-4 mr-2" /> Ghi bữa ăn
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs sm:text-sm active:scale-95 transition-transform"
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
