"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseExerciseNotes } from "@/lib/exercise-notes";

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number | null;
  weight_kg: number | null;
  notes: string | Record<string, any> | null;
}

interface Session {
  id: string;
  name: string;
  date: string;
  session_exercises?: Exercise[];
}

export default function VolumeProgressChart({
  sessions,
}: {
  sessions: Session[];
}) {
  const [selectedExercise, setSelectedExercise] = useState<string>("ALL");
  const [metric, setMetric] = useState<"VOLUME" | "1RM">("VOLUME");

  // Auto fallback to VOLUME metric if "ALL" exercises is chosen
  useEffect(() => {
    if (selectedExercise === "ALL") {
      setMetric("VOLUME");
    }
  }, [selectedExercise]);

  // Parse exercise notes to get correct volume
  const getExerciseVolume = (ex: Exercise) => {
    const { setsDetail } = parseExerciseNotes(ex.notes);
    if (setsDetail) {
      return setsDetail.reduce((sum: number, s: any) => {
        return sum + (Number(s.reps) || 0) * (Number(s.weight_kg) || 0);
      }, 0);
    }
    return (ex.sets || 0) * (ex.reps || 0) * (ex.weight_kg || 0);
  };

  // Calculate y y học thể thao Brzycki 1-Rep Max (1RM)
  const getExerciseOneRepMax = (ex: Exercise) => {
    let max1RM = 0;
    const { setsDetail } = parseExerciseNotes(ex.notes);
    if (setsDetail) {
      setsDetail.forEach((s: any) => {
        const w = Number(s.weight_kg) || 0;
        const r = Number(s.reps) || 0;
        if (w > 0 && r > 0) {
          const oneRm = r === 1 ? w : w / (1.0278 - 0.0278 * r);
          if (oneRm > max1RM) {
            max1RM = oneRm;
          }
        }
      });
      if (max1RM > 0) return Math.round(max1RM * 10) / 10;
    }
    const w = Number(ex.weight_kg) || 0;
    const r = Number(ex.reps) || 0;
    if (w > 0 && r > 0) {
      const oneRm = r === 1 ? w : w / (1.0278 - 0.0278 * r);
      return Math.round(oneRm * 10) / 10;
    }
    return 0;
  };

  // Get list of all unique exercise names performed
  const uniqueExercises = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      s.session_exercises?.forEach((ex) => {
        if (ex.exercise_name?.trim()) {
          set.add(ex.exercise_name.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [sessions]);

  // Aggregate volume and 1RM over time based on selected exercise
  const chartData = useMemo(() => {
    // Group sessions by date
    const dateMap: Record<
      string,
      { date: string; volume: number; oneRepMax: number; name: string }
    > = {};

    // Sort sessions ascending by date so progress flows left-to-right
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    sortedSessions.forEach((s) => {
      const dateKey = s.date;
      let vol = 0;
      let max1RM = 0;

      s.session_exercises?.forEach((ex) => {
        if (
          selectedExercise === "ALL" ||
          ex.exercise_name?.trim() === selectedExercise
        ) {
          vol += getExerciseVolume(ex);
          const single1RM = getExerciseOneRepMax(ex);
          if (single1RM > max1RM) {
            max1RM = single1RM;
          }
        }
      });

      if (vol > 0 || max1RM > 0) {
        if (dateMap[dateKey]) {
          dateMap[dateKey].volume += vol;
          if (max1RM > dateMap[dateKey].oneRepMax) {
            dateMap[dateKey].oneRepMax = max1RM;
          }
        } else {
          dateMap[dateKey] = {
            date: dateKey,
            volume: vol,
            oneRepMax: max1RM,
            name: s.name,
          };
        }
      }
    });

    return Object.values(dateMap).map((item) => ({
      ...item,
      displayDate: format(new Date(item.date), "dd/MM", { locale: vi }),
    }));
  }, [sessions, selectedExercise]);

  return (
    <div className="space-y-4">
      {/* Dropdown selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <span className="text-slate-400 text-xs sm:text-sm font-medium">
          Theo dõi tăng tiến sức mạnh của:
        </span>
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

      {/* Segmented Control Metric Selector */}
      {selectedExercise !== "ALL" && (
        <div className="flex bg-slate-800/40 p-1 rounded-lg border border-slate-700/50 w-fit gap-1">
          <button
            onClick={() => setMetric("VOLUME")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              metric === "VOLUME"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📊 Tổng Volume (Tích luỹ)
          </button>
          <button
            onClick={() => setMetric("1RM")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              metric === "1RM"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎯 Sức mạnh tối đa (Estimated 1RM)
          </button>
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <p className="text-slate-500 text-xs sm:text-sm">
            Chưa đủ dữ liệu để vẽ biểu đồ tăng trưởng tạ.
          </p>
        </div>
      ) : (
        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
                itemStyle={{
                  color: "#f97316",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload;
                  return `${item?.name || "Buổi tập"} (${item?.date ? format(new Date(item.date), "dd/MM/yyyy") : label})`;
                }}
                formatter={(value) => [
                  `${Number(value || 0).toLocaleString("vi-VN")} kg`,
                  metric === "VOLUME" ? "Tổng Volume" : "Estimated 1RM",
                ]}
              />
              <Line
                type="monotone"
                dataKey={metric === "VOLUME" ? "volume" : "oneRepMax"}
                stroke="#f97316"
                strokeWidth={3}
                dot={{
                  r: 4,
                  stroke: "#f97316",
                  strokeWidth: 2,
                  fill: "#0f172a",
                }}
                activeDot={{ r: 6, fill: "#f97316" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
