'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Xóa buổi tập này?')) return
    setLoading(true)
    const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
    if (error) {
      toast({ title: 'Lỗi xóa buổi tập', variant: 'destructive' })
    } else {
      toast({ title: 'Đã xóa buổi tập' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-slate-500 hover:text-red-400 hover:bg-slate-700 h-8 w-8"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}