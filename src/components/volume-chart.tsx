'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Exercise {
  id: string
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
  notes: string | null
}

interface Session {
  id: string
  name: string
  date: string
  session_exercises?: Exercise[]
}

export default function VolumeProgressChart({ sessions }: { sessions: Session[] }) {
  const [selectedExercise, setSelectedExercise] = useState<string>('ALL')

  // Parse exercise notes to get correct volume
  const getExerciseVolume = (ex: Exercise) => {
    if (ex.notes) {
      try {
        const parsed = JSON.parse(ex.notes)
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.setsDetail)) {
          return parsed.setsDetail.reduce((sum: number, s: any) => {
            return sum + ((Number(s.reps) || 0) * (Number(s.weight_kg) || 0))
          }, 0)
        }
      } catch (e) {
        // Not JSON notes
      }
    }
    return (ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0)
  }

  // Get list of all unique exercise names performed
  const uniqueExercises = useMemo(() => {
    const set = new Set<string>()
    sessions.forEach(s => {
      s.session_exercises?.forEach(ex => {
        if (ex.exercise_name?.trim()) {
          set.add(ex.exercise_name.trim())
        }
      })
    })
    return Array.from(set).sort()
  }, [sessions])

  // Aggregate volume over time based on selected exercise
  const chartData = useMemo(() => {
    // Group sessions by date
    const dateMap: Record<string, { date: string; volume: number; name: string }> = {}

    // Sort sessions ascending by date so progress flows left-to-right
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sortedSessions.forEach(s => {
      const dateKey = s.date
      let vol = 0

      s.session_exercises?.forEach(ex => {
        if (selectedExercise === 'ALL' || ex.exercise_name?.trim() === selectedExercise) {
          vol += getExerciseVolume(ex)
        }
      })

      if (vol > 0) {
        if (dateMap[dateKey]) {
          dateMap[dateKey].volume += vol
        } else {
          dateMap[dateKey] = {
            date: dateKey,
            volume: vol,
            name: s.name,
          }
        }
      }
    })

    return Object.values(dateMap).map(item => ({
      ...item,
      displayDate: format(new Date(item.date), 'dd/MM', { locale: vi }),
    }))
  }, [sessions, selectedExercise])

  return (
    <div className="space-y-4">
      {/* Dropdown selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <span className="text-slate-400 text-xs sm:text-sm font-medium">Theo dõi tăng tiến sức mạnh của:</span>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 w-full sm:w-64 focus:ring-orange-500"
        >
          <option value="ALL">📈 Tất cả bài tập (Tổng thể)</option>
          {uniqueExercises.map((exName, idx) => (
            <option key={idx} value={exName}>
              🏋️ {exName}
            </option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <p className="text-slate-500 text-xs sm:text-sm">Chưa đủ dữ liệu để vẽ biểu đồ tăng trưởng tạ.</p>
        </div>
      ) : (
        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false} 
                unit="kg"
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#f97316', fontSize: '13px', fontWeight: 'bold' }}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload
                  return `${item?.name || 'Buổi tập'} (${item?.date ? format(new Date(item.date), 'dd/MM/yyyy') : label})`
                }}
                formatter={(value) => [`${Number(value || 0).toLocaleString('vi-VN')} kg`, 'Tổng Volume'] }
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ r: 4, stroke: '#f97316', strokeWidth: 2, fill: '#0f172a' }}
                activeDot={{ r: 6, fill: '#f97316' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
