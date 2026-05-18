'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
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
      toast({ title: 'Tạo plan thành công!' })
      router.push('/dashboard/plans')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/plans">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Tạo Workout Plan</h1>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Thông tin plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Tên plan *</Label>
            <Input
              placeholder="VD: Push Pull Legs, Upper Lower..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Mô tả</Label>
            <Textarea
              placeholder="Mô tả chương trình tập, mục tiêu, số ngày/tuần..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? 'Đang tạo...' : 'Tạo plan'}
            </Button>
            <Link href="/dashboard/plans">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Hủy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}