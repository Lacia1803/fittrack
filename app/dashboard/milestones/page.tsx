import { createClient } from '@/lib/supabase/server'
import MilestonesClient from '@/components/milestones-client'

export default async function MilestonesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: sessionCount } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const { count: photoCount } = await supabase
    .from('progress_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Milestones</h1>
        <p className="text-slate-400 mt-1">Thành tích và mục tiêu của bạn</p>
      </div>
      <MilestonesClient
        userId={user!.id}
        initialSessionCount={sessionCount || 0}
        initialPhotoCount={photoCount || 0}
      />
    </div>
  )
}