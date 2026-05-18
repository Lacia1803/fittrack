import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Plus, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import DeleteSessionButton from '@/components/delete-session-button'

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*, session_exercises(*)')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Buổi tập</h1>
          <p className="text-slate-400 mt-1">Lịch sử tập luyện của bạn</p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Log buổi tập
          </Button>
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 p-2 rounded-lg">
                    <Dumbbell className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{session.name}</CardTitle>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>
                </div>
                <DeleteSessionButton sessionId={session.id} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {session.session_exercises ? session.session_exercises.length : 0} bài tập
                    </span>
                    {session.notes && (
                      <span className="truncate max-w-xs">{session.notes}</span>
                    )}
                  </div>
                  <Link href={`/dashboard/sessions/${session.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      Chi tiết
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Dumbbell className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Chưa có buổi tập nào</p>
          <p className="text-slate-500 text-sm mt-1">Bắt đầu log buổi tập đầu tiên</p>
          <Link href="/dashboard/sessions/new">
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Log ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}