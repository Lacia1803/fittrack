'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Session {
  date: string
  name: string
}

export default function DashboardChart({ sessions }: { sessions: Session[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = sessions.filter(s => s.date === dateStr).length
    return {
      day: format(date, 'EEE', { locale: vi }),
      count,
      dateStr,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={last7Days}>
        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ color: '#f97316' }}
          formatter={(value) => [`${value} buổi`, 'Số buổi tập']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {last7Days.map((entry, index) => (
            <Cell key={index} fill={entry.count > 0 ? '#f97316' : '#334155'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}