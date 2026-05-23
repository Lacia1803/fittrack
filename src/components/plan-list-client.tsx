'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Calendar, Trash2, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function PlanListClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === plans.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(plans.map((p) => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} Plan đã chọn? Các buổi tập thuộc Plan này cũng sẽ mất liên kết.`)) return

    setLoading(true)
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .in('id', Array.from(selectedIds))

    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa các Plan đã chọn.', variant: 'destructive' })
    } else {
      toast({ title: 'Thành công', description: `Đã xóa ${selectedIds.size} Plan.` })
      setPlans((prev) => prev.filter((p) => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {plans.length > 0 && (
        <div className="flex items-center justify-between bg-slate-800/50 p-3 border border-slate-700 rounded-lg max-w-full overflow-x-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs shrink-0"
            >
              <CheckSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{selectedIds.size === plans.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
            </Button>
            <span className="text-sm text-slate-400 whitespace-nowrap">
              Đã chọn: <strong className="text-white">{selectedIds.size}</strong>
            </span>
          </div>

          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white text-xs shrink-0"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{loading ? 'Đang xóa...' : 'Xóa mục đã chọn'}</span>
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`transition-colors relative overflow-hidden ${
              selectedIds.has(plan.id) 
                ? 'bg-orange-500/10 border-orange-500/50' 
                : 'bg-slate-800 border-slate-700 hover:border-orange-500/30'
            }`}
          >
            <div className="absolute top-4 right-4 z-10">
              <input
                type="checkbox"
                checked={selectedIds.has(plan.id)}
                onChange={() => toggleSelect(plan.id)}
                className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800 cursor-pointer"
              />
            </div>
            
            <div onClick={() => toggleSelect(plan.id)} className="cursor-pointer h-full flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between pb-2 pr-12">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-orange-500 shrink-0" />
                  <CardTitle className="text-white text-lg line-clamp-1">{plan.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {plan.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">{plan.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-2">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(plan.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </div>
                </div>
                <div className="pt-3" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/dashboard/plans/${plan.id}`}>
                    <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}