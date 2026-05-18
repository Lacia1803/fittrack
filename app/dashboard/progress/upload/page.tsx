'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import Image from 'next/image'

export default function UploadProgressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [takenAt, setTakenAt] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      toast({ title: 'Chỉ chấp nhận file ảnh', variant: 'destructive' })
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast({ title: 'Ảnh tối đa 5MB', variant: 'destructive' })
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.85); // 85% quality JPEG
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'Vui lòng chọn ảnh', variant: 'destructive' })
      return
    }
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated");

      // Nén ảnh trước khi upload
      const compressedFile = await compressImage(file);
      const filePath = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('progress_photos').insert({
        user_id: user.id,
        photo_url: filePath,
        caption: caption.trim() || null,
        taken_at: takenAt,
      })

      if (dbError) throw dbError;

      toast({ title: 'Upload ảnh thành công! 📸', description: 'Đã tối ưu hóa và nén dung lượng ảnh.' })
      router.push('/dashboard/progress')
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Có lỗi xảy ra', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/progress">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Upload Progress Photo</h1>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Chọn ảnh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          <div
            onClick={() => document.getElementById('photo-input')?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl h-64 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden relative"
          >
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-contain" />
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">Click để chọn ảnh</p>
                <p className="text-slate-500 text-sm">JPG, PNG, WebP — tối đa 5MB</p>
              </div>
            )}
          </div>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="space-y-2">
            <Label className="text-slate-300">Ngày chụp</Label>
            <Input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Caption (tuỳ chọn)</Label>
            <Textarea
              placeholder="VD: Tuần 4, weight 68kg, bắt đầu thấy định nghĩa cơ..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpload}
              disabled={loading || !file}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Đang upload...' : 'Upload ảnh'}
            </Button>
            <Link href="/dashboard/progress">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Hủy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}