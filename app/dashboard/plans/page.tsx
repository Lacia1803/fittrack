import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus } from 'lucide-react'
import Link from 'next/link'
import PlanListClient from '@/components/plan-list-client'

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: plans } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Workout Plans</h1>
          <p className="text-slate-400 mt-1">Quản lý chương trình tập luyện</p>
        </div>
        <Link href="/dashboard/plans/new">
          <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tạo plan mới
          </Button>
        </Link>
      </div>

      {plans && plans.length > 0 ? (
        <PlanListClient initialPlans={plans} />
      ) : (
        <div className="text-center py-20 bg-slate-800/20 border border-slate-700/50 outline-dashed outline-1 outline-slate-700 rounded-xl">
          <ClipboardList className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Chưa có workout plan nào</p>
          <p className="text-slate-500 text-sm mt-1">Tạo plan đầu tiên để bắt đầu</p>
          <Link href="/dashboard/plans/new">
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tạo plan ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}