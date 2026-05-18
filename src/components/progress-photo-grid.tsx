'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface Photo {
  id: string
  photo_url: string
  signed_url: string
  caption: string | null
  taken_at: string
}

export default function ProgressPhotoGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Xóa ảnh này?')) return
    await supabase.storage.from('progress-photos').remove([photo.photo_url])
    await supabase.from('progress_photos').delete().eq('id', photo.id)
    toast({ title: 'Đã xóa ảnh' })
    setSelected(null)
    router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-700 hover:border-orange-500 transition-colors"
          >
            <Image src={photo.signed_url} alt={photo.caption || 'Progress'} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-white text-xs">
                {format(new Date(photo.taken_at), 'dd/MM/yyyy', { locale: vi })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square">
              <Image src={selected.signed_url} alt="Progress" fill className="object-contain" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {format(new Date(selected.taken_at), 'dd MMMM yyyy', { locale: vi })}
                </p>
                {selected.caption && (
                  <p className="text-slate-400 text-sm mt-0.5">{selected.caption}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(selected)}
                  className="text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}