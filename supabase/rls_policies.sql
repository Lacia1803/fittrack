-- RLS policies for FitTrack (run in Supabase SQL Editor)
-- IMPORTANT: Review before running. These policies assume the following schema:
-- profiles(id uuid PRIMARY KEY), workout_plans(id, user_id), workout_sessions(id, user_id), session_exercises(id, session_id), progress_photos(id, user_id)

-- Enable RLS on tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_photos ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
-- Allow authenticated users to INSERT their own profile (auth.uid() must match new.id)
-- For INSERT policies, use WITH CHECK (and optionally TO authenticated) — no USING clause is allowed for INSERT.
CREATE POLICY "Profiles insert own" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile
CREATE POLICY "Profiles select own" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Profiles update own" ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Prevent public access
REVOKE ALL ON public.profiles FROM public;

-- ---------- workout_plans ----------
-- Only allow users to operate on their own plans
CREATE POLICY "Plans select own" ON public.workout_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Plans insert own" ON public.workout_plans
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Plans update own" ON public.workout_plans
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Plans delete own" ON public.workout_plans
FOR DELETE USING (auth.uid() = user_id);

REVOKE ALL ON public.workout_plans FROM public;

-- ---------- workout_sessions ----------
CREATE POLICY "Sessions select own" ON public.workout_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sessions insert own" ON public.workout_sessions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sessions update own" ON public.workout_sessions
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sessions delete own" ON public.workout_sessions
FOR DELETE USING (auth.uid() = user_id);

REVOKE ALL ON public.workout_sessions FROM public;

-- ---------- session_exercises ----------
-- session_exercises are owned implicitly by the session's user. We check the parent session.
CREATE POLICY "SessionExercises select own" ON public.session_exercises
FOR SELECT USING (
  (SELECT user_id FROM public.workout_sessions WHERE id = session_exercises.session_id) = auth.uid()
);

CREATE POLICY "SessionExercises insert own" ON public.session_exercises
FOR INSERT TO authenticated WITH CHECK (
  (SELECT user_id FROM public.workout_sessions WHERE id = session_id) = auth.uid()
);

CREATE POLICY "SessionExercises update own" ON public.session_exercises
FOR UPDATE USING (
  (SELECT user_id FROM public.workout_sessions WHERE id = session_exercises.session_id) = auth.uid()
) WITH CHECK (
  (SELECT user_id FROM public.workout_sessions WHERE id = session_id) = auth.uid()
);

CREATE POLICY "SessionExercises delete own" ON public.session_exercises
FOR DELETE USING (
  (SELECT user_id FROM public.workout_sessions WHERE id = session_exercises.session_id) = auth.uid()
);

REVOKE ALL ON public.session_exercises FROM public;

-- ---------- progress_photos ----------
CREATE POLICY "Photos select own" ON public.progress_photos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Photos insert own" ON public.progress_photos
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Photos update own" ON public.progress_photos
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Photos delete own" ON public.progress_photos
FOR DELETE USING (auth.uid() = user_id);

REVOKE ALL ON public.progress_photos FROM public;

-- Notes:
-- 1) If you use different table or column names, adapt queries accordingly.
-- 2) For public read-only endpoints (if needed), create explicit SELECT policies that allow public or service_role.
-- 3) Storage bucket policies are managed separately in Supabase bucket settings. To restrict storage access to owner, include a metadata field like user_id in the object's metadata and create corresponding policies in the "storage.objects" table.
-- 4) After running, test as an authenticated user and as an anon user to ensure expected access.

-- Optional: create a helper function to check ownership (example omitted)

-- End of RLS policy file
