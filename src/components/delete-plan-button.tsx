'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DeletePlanButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Xóa plan này?')) return
    setLoading(true)
    const { error } = await supabase.from('workout_plans').delete().eq('id', planId)
    if (error) {
      toast({ title: 'Lỗi xóa plan', variant: 'destructive' })
    } else {
      toast({ title: 'Đã xóa plan' })
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