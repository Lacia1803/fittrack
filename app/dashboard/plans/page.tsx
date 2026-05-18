import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import DeletePlanButton from '@/components/delete-plan-button'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workout Plans</h1>
          <p className="text-slate-400 mt-1">Quản lý chương trình tập luyện</p>
        </div>
        <Link href="/dashboard/plans/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tạo plan mới
          </Button>
        </Link>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-orange-500 shrink-0" />
                  <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                </div>
                <DeletePlanButton planId={plan.id} />
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.description && (
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                )}
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(plan.created_at), 'dd/MM/yyyy', { locale: vi })}
                </div>
                <Link href={`/dashboard/plans/${plan.id}`}>
                  <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Xem chi tiết
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
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