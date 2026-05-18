'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Download, X, Dumbbell } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Exercise {
  id: string
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
}

interface Session {
  id: string
  name: string
  date: string
  session_exercises?: Exercise[]
}

interface SessionShareButtonProps {
  session: Session
  totalVolume: number
}

export default function SessionShareButton({ session, totalVolume }: SessionShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions (double for high DPI crispness)
    canvas.width = 800
    canvas.height = 1000

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 1. Draw elegant dark background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0f172a') // slate-900
    gradient.addColorStop(0.5, '#1e293b') // slate-800
    gradient.addColorStop(1, '#020617') // slate-950
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. Draw modern glow effects
    const glowGradient = ctx.createRadialGradient(
      canvas.width - 150, 150, 10,
      canvas.width - 150, 150, 300
    )
    glowGradient.addColorStop(0, 'rgba(249, 115, 22, 0.15)') // orange glow
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(canvas.width - 150, 150, 350, 0, Math.PI * 2)
    ctx.fill()

    // 3. Draw FitTrack Header Brand
    ctx.fillStyle = '#f97316' // orange-500
    ctx.beginPath()
    // draw a dumbbell icon shape
    ctx.roundRect(50, 52, 12, 36, 6)
    ctx.roundRect(86, 52, 12, 36, 6)
    ctx.fill()
    ctx.fillStyle = '#fdba74' // orange-300
    ctx.beginPath()
    ctx.roundRect(62, 64, 24, 12, 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('FitTrack', 115, 78)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px sans-serif'
    ctx.fillText('TRACK YOUR GAINS', 115, 100)

    // 4. Draw card panel borders/decoration
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(40, 140, canvas.width - 80, canvas.height - 200, 24)
    ctx.stroke()

    // 5. Draw Session Title & Date
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(session.name, 70, 205)

    ctx.fillStyle = '#f97316'
    ctx.font = 'bold 18px sans-serif'
    const formattedDate = format(new Date(session.date), 'EEEE, dd/MM/yyyy', { locale: vi })
    ctx.fillText(formattedDate.toUpperCase(), 70, 240)

    // 6. Draw metrics layout boxes
    // Box 1: Total Volume
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)'
    ctx.beginPath()
    ctx.roundRect(70, 280, 310, 110, 16)
    ctx.fill()
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)'
    ctx.beginPath()
    ctx.roundRect(70, 280, 310, 110, 16)
    ctx.stroke()

    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px sans-serif'
    ctx.fillText('TỔNG KHỐI LƯỢNG TẬP', 95, 315)

    ctx.fillStyle = '#f97316'
    ctx.font = 'bold 32px sans-serif font-mono'
    ctx.fillText(`${totalVolume.toLocaleString('vi-VN')} kg`, 95, 360)

    // Box 2: Total Exercises
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)'
    ctx.beginPath()
    ctx.roundRect(420, 280, 310, 110, 16)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.beginPath()
    ctx.roundRect(420, 280, 310, 110, 16)
    ctx.stroke()

    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px sans-serif'
    ctx.fillText('SỐ BÀI TẬP HOÀN THÀNH', 445, 315)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px sans-serif font-mono'
    ctx.fillText(`${session.session_exercises?.length || 0} bài`, 445, 360)

    // 7. Draw exercise list title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('DANH SÁCH BÀI TẬP', 70, 445)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.beginPath()
    ctx.moveTo(70, 465)
    ctx.lineTo(canvas.width - 70, 465)
    ctx.stroke()

    // 8. Draw exercises
    let yPos = 510
    const list = session.session_exercises || []

    list.slice(0, 7).forEach((ex, i) => {
      // Draw exercise number circle
      ctx.fillStyle = 'rgba(249, 115, 22, 0.1)'
      ctx.beginPath()
      ctx.arc(90, yPos - 8, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 16px sans-serif font-mono'
      ctx.textAlign = 'center'
      ctx.fillText(`${i + 1}`, 90, yPos - 2)
      ctx.textAlign = 'left'

      // Exercise Name
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText(ex.exercise_name, 130, yPos)

      // Reps / Sets details
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px sans-serif font-mono'
      let details = `${ex.sets} hiệp`
      if (ex.reps) details += ` × ${ex.reps} reps`
      if (ex.weight_kg !== null) {
        details += ` @ ${ex.weight_kg === 0 ? 'Bodyweight' : `${ex.weight_kg}kg`}`
      }
      ctx.fillText(details, 130, yPos + 25)

      // Draw underline separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.beginPath()
      ctx.moveTo(70, yPos + 45)
      ctx.lineTo(canvas.width - 70, yPos + 45)
      ctx.stroke()

      yPos += 70
    })

    if (list.length > 7) {
      ctx.fillStyle = '#64748b'
      ctx.font = 'italic 16px sans-serif'
      ctx.fillText(`...và thêm ${list.length - 7} bài tập khác`, 70, yPos)
    }

    // 9. Footer watermark
    ctx.fillStyle = '#475569'
    ctx.font = '14px sans-serif font-mono'
    ctx.fillText('Đồng hành cùng sức khoẻ của bạn mỗi ngày', 70, canvas.height - 85)
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawCard, 100) // wait for canvas mount
    }
  }, [isOpen])

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${session.name.replace(/\s+/g, '_')}_Workout.png`
    link.href = url
    link.click()
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-slate-800 border-slate-700/50 hover:bg-slate-700 text-slate-100 hover:text-white flex items-center gap-2"
        variant="outline"
      >
        <Share2 className="h-4 w-4" />
        Chia sẻ
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-orange-500" />
                Thành tích hôm nay!
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center min-h-[300px] bg-slate-950/20">
              {/* Canvas styled to fit in the preview beautifully */}
              <canvas
                ref={canvasRef}
                className="w-full max-w-[340px] aspect-[4/5] object-contain rounded-xl border border-slate-800 shadow-lg"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
              <Button
                onClick={downloadImage}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Tải ảnh chia sẻ
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="border-slate-800 text-slate-400 hover:bg-slate-800"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
