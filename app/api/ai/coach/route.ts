import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX || 20);
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.AI_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000,
);

type RateLimitEntry = { count: number; resetAt: number };

type RateLimitStore = {
  store: Map<string, RateLimitEntry>;
};

const getRateLimitStore = () => {
  const globalStore = globalThis as typeof globalThis & {
    __fittrackRateLimit?: RateLimitStore;
  };
  if (!globalStore.__fittrackRateLimit) {
    globalStore.__fittrackRateLimit = { store: new Map() };
  }
  return globalStore.__fittrackRateLimit;
};

const getClientKey = (request: NextRequest, userId: string | null) => {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return `ip:${forwarded.split(",")[0].trim()}`;
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp}`;
  return "ip:unknown";
};

const checkRateLimit = (key: string) => {
  const store = getRateLimitStore().store;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(key, entry);
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetAt: entry.resetAt,
  };
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const message = body?.message;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI_NOT_CONFIGURED" }, { status: 500 });
  }

  const limitKey = getClientKey(request, user.id);
  const rate = checkRateLimit(limitKey);
  if (!rate.allowed) {
    const retryAfter = Math.max(
      1,
      Math.ceil((rate.resetAt - Date.now()) / 1000),
    );
    return NextResponse.json(
      { error: "RATE_LIMITED", retryAfter },
      { status: 429, headers: { "Retry-After": `${retryAfter}` } },
    );
  }

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("workout_sessions")
      .select("*, session_exercises(*)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(6),
  ]);

  const weight = profile?.weight_kg || 70;
  const height = profile?.height_cm || 170;
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
  const sessionSummary = (sessions || [])
    .map(
      (s) =>
        `Buoi tap ${s.name} ngay ${s.date} co ${s.session_exercises?.length || 0} bai tap`,
    )
    .join(", ");

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contextPrompt = `Ban la Coach AI - huan luyen vien ca nhan cua FitTrack.
Hom nay la: ${today}.
Thong tin hoc vien: Cao ${height}cm, Nang ${weight}kg, BMI ${bmi}.
Lich su tap luyen gan day: ${sessionSummary || "Chua co buoi tap nao"}.
Hay tra loi cau hoi sau mot cach ngan gon, suc tich, co dong luc bang tieng Viet. TUYET DOI KHONG su dung markdown (khong dung bieu tuong ** hay *). Chi dung van ban thuan (plain text):
Cau hoi: "${message}"`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: contextPrompt }] }],
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "AI_UPSTREAM_ERROR" }, { status: 502 });
  }

  const resData = await response.json();
  let aiReply = resData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiReply) {
    return NextResponse.json({ error: "AI_EMPTY_RESPONSE" }, { status: 502 });
  }

  // Xóa mọi dấu * còn sót lại trong trường hợp AI vẫn cố tình trả về
  aiReply = aiReply.replace(/\*/g, "");

  return NextResponse.json({ reply: aiReply, remaining: rate.remaining });
}
