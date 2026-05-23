'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast({ title: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      toast({ title: 'Lỗi đăng ký', description: error.message, variant: 'destructive' })
      setLoading(false)
    } else {
      toast({ title: 'Đăng ký thành công!', description: 'Chào mừng bạn đến với FitTrack' })
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-10 w-10 text-orange-500" />
          </div>
          <CardTitle className="text-white text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription className="text-slate-400">Bắt đầu hành trình fitness của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Họ tên</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Mật khẩu</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
          <p className="text-center text-slate-400 text-sm">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-orange-400 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}