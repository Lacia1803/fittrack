import { createClient } from "@/lib/supabase/server";
import WorkoutsClient from "./workouts-client";

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plans }, { data: sessions }] = await Promise.all([
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("workout_sessions")
      .select("*, session_exercises(*)")
      .eq("user_id", user!.id)
      .order("date", { ascending: false }),
  ]);

  return (
    <WorkoutsClient
      plans={plans || []}
      sessions={sessions || []}
      defaultTab={searchParams.tab || "sessions"}
    />
  );
}
