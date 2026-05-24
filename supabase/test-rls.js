/**
 * supabase/test-rls.js
 *
 * Usage:
 * 1. Install deps: npm install dotenv @supabase/supabase-js
 * 2. Create .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 * 3. Run: node supabase/test-rls.js
 *
 * The script creates two temporary users, exercises the core tables with
 * authenticated clients, and prints whether each RLS rule blocks or allows
 * the action as expected.
 */

require("dotenv").config({ path: "./.env.local" });
const { createClient } = require("@supabase/supabase-js");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!URL || !ANON) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
  );
  process.exit(1);
}

if (!SERVICE) {
  console.error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (required to create test users).",
  );
  process.exit(1);
}

const admin = createClient(URL, SERVICE);
const anon = createClient(URL, ANON);

const rand = () => Math.random().toString(36).slice(2, 8);
const isoNow = () => new Date().toISOString();

function createAuthedClient(accessToken) {
  return createClient(URL, ANON, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function createTestUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function signIn(email, password) {
  const client = createClient(URL, ANON);
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return { token: data.session.access_token, user: data.user };
}

function summarizeSelect(result) {
  if (result.error) return `ERROR: ${result.error.message}`;
  return `${result.data.length} rows`;
}

function summarizeMutation(result) {
  if (result.error) return `BLOCKED: ${result.error.message}`;
  if (Array.isArray(result.data) && result.data.length === 0)
    return "BLOCKED: 0 rows affected";
  return "ALLOWED";
}

function summarizeDelete(result) {
  if (result.error) return `BLOCKED: ${result.error.message}`;
  if (Array.isArray(result.data) && result.data.length === 0)
    return "BLOCKED: 0 rows affected";
  return `ALLOWED: ${result.data.length} rows deleted`;
}

async function run() {
  const cleanup = {
    profileIds: [],
    planIds: [],
    sessionIds: [],
    exerciseIds: [],
    photoIds: [],
    userIds: [],
  };

  try {
    console.log("Creating two test users...");
    const u1 = `test1+${rand()}@example.com`;
    const p1 = `Passw0rd!${rand()}`;
    const u2 = `test2+${rand()}@example.com`;
    const p2 = `Passw0rd!${rand()}`;

    const userA = await createTestUser(u1, p1);
    const userB = await createTestUser(u2, p2);
    cleanup.userIds.push(userA.id, userB.id);
    console.log("Created users:", userA.id, userB.id);

    console.log("Signing in users to obtain tokens...");
    const a = await signIn(u1, p1);
    const b = await signIn(u2, p2);

    const clientA = createAuthedClient(a.token);
    const clientB = createAuthedClient(b.token);

    console.log("\n== ANON SELECT TESTS ==");
    console.log(
      "profiles:",
      summarizeSelect(await anon.from("profiles").select("*")),
    );
    console.log(
      "workout_plans:",
      summarizeSelect(await anon.from("workout_plans").select("*")),
    );
    console.log(
      "workout_sessions:",
      summarizeSelect(await anon.from("workout_sessions").select("*")),
    );
    console.log(
      "session_exercises:",
      summarizeSelect(await anon.from("session_exercises").select("*")),
    );
    console.log(
      "progress_photos:",
      summarizeSelect(await anon.from("progress_photos").select("*")),
    );

    console.log("\n== PROFILES ==");
    const profileInsert = await clientA
      .from("profiles")
      .insert({
        id: userA.id,
        full_name: `RLS Test ${rand()}`,
        weight_kg: 70,
        height_cm: 175,
      })
      .select();
    if (profileInsert.error) {
      console.log(
        "User A insert own profile:",
        `BLOCKED OR EXISTS: ${profileInsert.error.message}`,
      );
    } else {
      cleanup.profileIds.push(profileInsert.data[0].id);
      console.log("User A insert own profile:", "ALLOWED");
    }

    const profileSelectA = await clientA
      .from("profiles")
      .select("*")
      .eq("id", userA.id);
    console.log("User A select own profile:", summarizeSelect(profileSelectA));

    const profileUpdateA = await clientA
      .from("profiles")
      .update({
        full_name: `Updated ${rand()}`,
        weight_kg: 71,
      })
      .eq("id", userA.id)
      .select();
    console.log(
      "User A update own profile:",
      summarizeMutation(profileUpdateA),
    );

    console.log("\n== WORKOUT PLANS ==");
    const planInsertA = await clientA
      .from("workout_plans")
      .insert({
        user_id: userA.id,
        name: `Plan A ${rand()}`,
        description: "RLS test",
      })
      .select();
    if (planInsertA.error) throw planInsertA.error;
    const planAId = planInsertA.data[0].id;
    cleanup.planIds.push(planAId);
    console.log("User A insert own plan:", "ALLOWED", planAId);

    const planSelectB = await clientB
      .from("workout_plans")
      .select("*")
      .eq("id", planAId);
    console.log("User B select A plan:", summarizeSelect(planSelectB));

    const planUpdateA = await clientA
      .from("workout_plans")
      .update({ name: "Plan A updated" })
      .eq("id", planAId)
      .select();
    console.log("User A update own plan:", summarizeMutation(planUpdateA));

    const planUpdateB = await clientB
      .from("workout_plans")
      .update({ name: "Bad update" })
      .eq("id", planAId)
      .select();
    console.log("User B update A plan:", summarizeMutation(planUpdateB));

    const planDeleteB = await clientB
      .from("workout_plans")
      .delete()
      .eq("id", planAId)
      .select();
    console.log("User B delete A plan:", summarizeDelete(planDeleteB));

    console.log("\n== WORKOUT SESSIONS ==");
    const sessionInsertA = await clientA
      .from("workout_sessions")
      .insert({
        user_id: userA.id,
        plan_id: planAId,
        name: `Session A ${rand()}`,
        notes: "manual rls test",
        date: isoNow().slice(0, 10),
      })
      .select();
    if (sessionInsertA.error) throw sessionInsertA.error;
    const sessionAId = sessionInsertA.data[0].id;
    cleanup.sessionIds.push(sessionAId);
    console.log("User A insert own session:", "ALLOWED", sessionAId);

    const sessionSelectB = await clientB
      .from("workout_sessions")
      .select("*")
      .eq("id", sessionAId);
    console.log("User B select A session:", summarizeSelect(sessionSelectB));

    const sessionUpdateA = await clientA
      .from("workout_sessions")
      .update({ notes: "updated session notes" })
      .eq("id", sessionAId)
      .select();
    console.log(
      "User A update own session:",
      summarizeMutation(sessionUpdateA),
    );

    const sessionDeleteB = await clientB
      .from("workout_sessions")
      .delete()
      .eq("id", sessionAId)
      .select();
    console.log("User B delete A session:", summarizeDelete(sessionDeleteB));

    console.log("\n== SESSION EXERCISES ==");
    const exerciseInsertA = await clientA
      .from("session_exercises")
      .insert({
        session_id: sessionAId,
        exercise_name: `Bench Press ${rand()}`,
        sets: 3,
        reps: 8,
        weight_kg: 60,
        duration_minutes: null,
        notes: "manual rls test",
      })
      .select();
    if (exerciseInsertA.error) throw exerciseInsertA.error;
    const exerciseAId = exerciseInsertA.data[0].id;
    cleanup.exerciseIds.push(exerciseAId);
    console.log(
      "User A insert exercise in own session:",
      "ALLOWED",
      exerciseAId,
    );

    const exerciseSelectB = await clientB
      .from("session_exercises")
      .select("*")
      .eq("id", exerciseAId);
    console.log("User B select A exercise:", summarizeSelect(exerciseSelectB));

    const exerciseUpdateA = await clientA
      .from("session_exercises")
      .update({ reps: 10 })
      .eq("id", exerciseAId)
      .select();
    console.log(
      "User A update own exercise:",
      summarizeMutation(exerciseUpdateA),
    );

    const exerciseUpdateB = await clientB
      .from("session_exercises")
      .update({ reps: 12 })
      .eq("id", exerciseAId)
      .select();
    console.log(
      "User B update A exercise:",
      summarizeMutation(exerciseUpdateB),
    );

    const exerciseDeleteB = await clientB
      .from("session_exercises")
      .delete()
      .eq("id", exerciseAId)
      .select();
    console.log("User B delete A exercise:", summarizeDelete(exerciseDeleteB));

    console.log("\n== PROGRESS PHOTOS ==");
    const photoInsertA = await clientA
      .from("progress_photos")
      .insert({
        user_id: userA.id,
        photo_url: `manual-rls/${rand()}.jpg`,
        caption: `photo ${rand()}`,
        taken_at: isoNow(),
      })
      .select();
    if (photoInsertA.error) throw photoInsertA.error;
    const photoAId = photoInsertA.data[0].id;
    cleanup.photoIds.push(photoAId);
    console.log("User A insert own photo row:", "ALLOWED", photoAId);

    const photoSelectB = await clientB
      .from("progress_photos")
      .select("*")
      .eq("id", photoAId);
    console.log("User B select A photo:", summarizeSelect(photoSelectB));

    const photoUpdateA = await clientA
      .from("progress_photos")
      .update({ caption: "updated caption" })
      .eq("id", photoAId)
      .select();
    console.log("User A update own photo:", summarizeMutation(photoUpdateA));

    const photoDeleteB = await clientB
      .from("progress_photos")
      .delete()
      .eq("id", photoAId)
      .select();
    console.log("User B delete A photo:", summarizeDelete(photoDeleteB));

    console.log("\n== CLEANUP ==");
    if (cleanup.exerciseIds.length) {
      await admin
        .from("session_exercises")
        .delete()
        .in("id", cleanup.exerciseIds);
    }
    if (cleanup.sessionIds.length) {
      await admin
        .from("workout_sessions")
        .delete()
        .in("id", cleanup.sessionIds);
    }
    if (cleanup.planIds.length) {
      await admin.from("workout_plans").delete().in("id", cleanup.planIds);
    }
    if (cleanup.photoIds.length) {
      await admin.from("progress_photos").delete().in("id", cleanup.photoIds);
    }
    if (cleanup.profileIds.length) {
      await admin.from("profiles").delete().in("id", cleanup.profileIds);
    }
    await admin.auth.admin.deleteUser(userA.id);
    await admin.auth.admin.deleteUser(userB.id);
    console.log("Deleted test rows and users.");
  } catch (err) {
    console.error("Test error:", err.message || err);
    process.exitCode = 2;
  }
}

run();
