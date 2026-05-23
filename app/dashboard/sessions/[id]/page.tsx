import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Dumbbell, FileText, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import SessionShareButton from '@/components/session-share-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SessionDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: session } = await supabase
    .from('workout_sessions')
    .select('*, session_exercises(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) return notFound()

  const parseExerciseNotes = (notesStr: string | null) => {
    if (!notesStr) return { setsDetail: null, userNotes: null }
    try {
      const parsed = JSON.parse(notesStr)
      if (parsed && typeof parsed === 'object' && ('setsDetail' in parsed)) {
        return {
          setsDetail: parsed.setsDetail as any[],
          userNotes: parsed.userNotes || null
        }
      }
    } catch (e) {
      // Not JSON
    }
    return { setsDetail: null, userNotes: notesStr }
  }

  // Tính toán tổng volume của buổi tập
  const totalVolume = session.session_exercises?.reduce((acc: number, curr: any) => {
    const { setsDetail } = parseExerciseNotes(curr.notes)
    if (setsDetail && setsDetail.length > 0) {
      const setsVol = setsDetail.reduce((sa: number, s: any) => {
        const r = Number(s.reps) || 0
        const w = Number(s.weight_kg) || 0
        return sa + (r * w)
      }, 0)
      return acc + setsVol
    }
    
    const sets = curr.sets || 0
    const reps = curr.reps || 0
    const weight = curr.weight_kg || 0
    return acc + (sets * reps * weight)
  }, 0) || 0

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/sessions">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Chi tiết Buổi Tập</h1>
        </div>

        <SessionShareButton session={session} totalVolume={totalVolume} />
      </div>

      {/* Main Details */}
      <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{session.name}</h2>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
              <Calendar className="h-4 w-4 text-slate-500" />
              {format(new Date(session.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 border-t border-slate-800">
          {session.notes && (
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
              <span className="text-slate-400 text-xs block font-semibold mb-1 uppercase tracking-wider">Ghi chú buổi tập</span>
              <p className="text-slate-200 text-sm leading-relaxed">{session.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 text-center">
              <span className="text-slate-500 text-xs block">Tổng Volume</span>
              <span className="text-2xl font-bold text-orange-500 font-mono mt-1 block">
                {totalVolume.toLocaleString('vi-VN')} <span className="text-xs text-slate-400">kg</span>
              </span>
            </div>
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 text-center">
              <span className="text-slate-500 text-xs block">Số bài tập</span>
              <span className="text-2xl font-bold text-white font-mono mt-1 block">
                {session.session_exercises?.length || 0} <span className="text-xs text-slate-400">bài</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises list */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          Danh sách bài tập
        </h3>

        {session.session_exercises && session.session_exercises.length > 0 ? (
          <div className="space-y-3">
            {session.session_exercises.map((ex: any, idx: number) => {
              const { setsDetail, userNotes } = parseExerciseNotes(ex.notes)
              return (
                <Card key={ex.id} className="bg-slate-900/30 border-slate-800 hover:border-slate-700/50 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-orange-500/80 text-xs font-semibold uppercase tracking-wider block">Bài {idx + 1}</span>
                        <h4 className="text-lg font-bold text-white mt-0.5">{ex.exercise_name}</h4>
                      </div>
                      
                      {!setsDetail && (
                        <div className="flex gap-4 text-right">
                          <div>
                            <span className="text-slate-500 text-xxs block">Sets</span>
                            <span className="text-md font-bold text-slate-200 font-mono">{ex.sets}</span>
                          </div>
                          {ex.reps && (
                            <div>
                              <span className="text-slate-500 text-xxs block">Reps</span>
                              <span className="text-md font-bold text-slate-200 font-mono">{ex.reps}</span>
                            </div>
                          )}
                          {ex.weight_kg !== null && (
                            <div>
                              <span className="text-slate-500 text-xxs block">Tạ (kg)</span>
                              <span className="text-md font-bold text-slate-200 font-mono">
                                {ex.weight_kg === 0 ? 'BW' : `${ex.weight_kg} kg`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {setsDetail ? (
                      <div className="space-y-2 pt-1">
                        <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">Thông số các hiệp:</span>
                        <div className="flex flex-wrap gap-2">
                          {setsDetail.map((set: any, sIdx: number) => (
                            <span
                              key={sIdx}
                              className={`bg-slate-950/40 border text-xs px-2.5 py-1.5 rounded-lg font-mono flex items-center gap-1.5 ${
                                set.completed ? 'border-orange-500/30 text-white' : 'border-slate-800/80 text-slate-500'
                              }`}
                            >
                              <span>Hiệp {sIdx + 1}:</span>
                              <span className="font-bold text-orange-400">{set.weight_kg === '' || set.weight_kg === 0 ? 'BW' : `${set.weight_kg}kg`}</span>
                              <span>×</span>
                              <span className="font-bold text-white">{set.reps || 0}</span>
                              {set.rpe && <span className="text-slate-500 text-[10px]">(RPE {set.rpe})</span>}
                              {set.completed && <span className="text-[10px] bg-orange-500/15 text-orange-400 px-1 rounded-sm">✓</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {userNotes && (
                      <p className="text-slate-400 text-xs bg-slate-800/20 border-l-2 border-orange-500/40 pl-2.5 py-1">
                        {userNotes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-6 bg-slate-900/20 rounded-xl border border-slate-800">
            Không có thông tin chi tiết bài tập nào.
          </p>
        )}
      </div>
    </div>
  )
}
