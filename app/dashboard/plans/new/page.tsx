'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Target, AlignLeft, Info, Zap, Dumbbell, CalendarDays, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function NewPlanPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Vui lòng nhập tên plan', variant: 'destructive' })
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('workout_plans').insert({
      name: name.trim(),
      description: description.trim() || null,
      user_id: user!.id,
    })
    if (error) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Thành công', description: 'Tạo chương trình tập luyện mới thành công!' })
      router.push('/dashboard/plans')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/plans">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Tạo Workout Plan</h1>
            <p className="text-slate-400 mt-1 text-sm">Bắt đầu chặng đường thay đổi vóc dáng của bạn</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="premium-glass-card border-slate-700/50 shadow-xl overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-rose-500" />
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription className="text-slate-400">
                Đặt tên và mô tả chi tiết chương trình tập của bạn để dễ dàng theo dõi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-300 font-semibold flex items-center gap-2">
                  Tên chương trình (Plan Name) <span className="text-orange-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-500">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="VD: Push Pull Legs, Upper Lower, Full Body..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 focus-visible:border-orange-500 transition-all text-md"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-slate-300 font-semibold flex items-center gap-2">
                  Mục tiêu & Mô tả
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-500">
                    <AlignLeft className="h-5 w-5" />
                  </div>
                  <Textarea
                    placeholder="Mô tả số ngày tập mỗi tuần, nhóm cơ focus, hoặc cường độ dự kiến..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="pl-10 pt-3 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 focus-visible:border-orange-500 transition-all resize-y"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
             <Button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
             >
                {loading ? 'Đang khởi tạo...' : 'Tạo mới ngay'}
             </Button>
             <Link href="/dashboard/plans" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                   Hủy bỏ
                </Button>
             </Link>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="bg-slate-800/40 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-400" />
                Mẹo nhỏ cho bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <Zap className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium text-sm">Gợi ý cách chia lịch</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Bạn có thể tạo các plan theo cấu trúc phổ biến như <strong>PPL</strong> (Push/Pull/Legs) cho 6 ngày/tuần, hoặc <strong>Upper/Lower</strong> cho 4 ngày/tuần.
                  </p>
                </div>
              </div>
              <div className="h-px bg-slate-700/50 w-full" />
              <div className="flex gap-3 items-start">
                <CalendarDays className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium text-sm">Lợi ích của Plan</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Nhóm các buổi tập vào chung một Plan giúp bạn dễ dàng theo dõi sự tiến bộ về mức tạ (Progressive Overload) cực kỳ trực quan.
                  </p>
                </div>
              </div>
              <div className="h-px bg-slate-700/50 w-full" />
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium text-sm">Tự động hoá AI</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Khai báo mô tả chi tiết, AI Coach sẽ đọc được những lưu ý này và đưa ra những tư vấn chính xác hơn cho lộ trình riêng của bạn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}