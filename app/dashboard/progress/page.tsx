import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Camera, Plus } from 'lucide-react'
import Link from 'next/link'
import ProgressPhotoGrid from '@/components/progress-photo-grid'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user!.id)
    .order('taken_at', { ascending: false })

  const signedPhotos = await Promise.all(
    (photos || []).map(async (photo) => {
      if (photo.photo_url.startsWith('http')) {
        return { ...photo, signed_url: photo.photo_url }
      }
      try {
        const { data } = await supabase.storage
          .from('progress-photos')
          .createSignedUrl(photo.photo_url, 3600)
        return { ...photo, signed_url: data?.signedUrl || '' }
      } catch (e) {
        console.error("Error creating signed URL:", e)
        return { ...photo, signed_url: '' }
      }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Progress Photos</h1>
          <p className="text-slate-400 mt-1">Theo dõi sự thay đổi của cơ thể</p>
        </div>
        <Link href="/dashboard/progress/upload">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Upload ảnh
          </Button>
        </Link>
      </div>

      {signedPhotos.length > 0 ? (
        <ProgressPhotoGrid photos={signedPhotos} />
      ) : (
        <div className="text-center py-20">
          <Camera className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Chưa có ảnh nào</p>
          <p className="text-slate-500 text-sm mt-1">Upload ảnh đầu tiên để bắt đầu theo dõi</p>
          <Link href="/dashboard/progress/upload">
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Upload ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}