import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Hồ sơ</h1>
        <p className="text-slate-400 mt-1">Thông tin cá nhân và thể trạng</p>
      </div>
      <ProfileClient profile={profile} />
    </div>
  )
}