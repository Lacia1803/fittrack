import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: planCount },
    { count: sessionCount },
    { count: photoCount },
    { data: recentSessions },
    { data: profile }
  ] = await Promise.all([
    supabase.from('workout_plans').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('workout_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('progress_photos').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('workout_sessions')
      .select('id, date, name, session_exercises(id, exercise_name, sets, reps, weight_kg, notes)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(90), // Fetch up to 90 sessions to allow full historical range filtering
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
  ])

  return (
    <DashboardClient
      initialSessions={recentSessions || []}
      planCount={planCount || 0}
      sessionCount={sessionCount || 0}
      photoCount={photoCount || 0}
      profile={profile || null}
    />
  )
}