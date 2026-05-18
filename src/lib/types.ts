export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  weight_kg: number | null
  height_cm: number | null
  created_at: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  plan_id: string | null
  name: string
  notes: string | null
  date: string
  created_at: string
  session_exercises?: SessionExercise[]
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_name: string
  sets: number
  reps: number | null
  weight_kg: number | null
  duration_minutes: number | null
  notes: string | null
}

export interface ProgressPhoto {
  id: string
  user_id: string
  photo_url: string
  caption: string | null
  taken_at: string
  created_at: string
}