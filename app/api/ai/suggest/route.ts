import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { context, type } = body || {};

  if (!context || !type) {
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

  // Lấy thông tin user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const bioInfo = profile
    ? `Học viên: Cân nặng ${profile.weight_kg || "N/A"}kg, Chiều cao ${profile.height_cm || "N/A"}cm, Mục tiêu: ${profile.fitness_goal || "Chưa thiết lập"}, Giới tính: ${profile.gender || "Chưa rõ"}, Kinh nghiệm: ${profile.experience_level || "Chưa rõ"}. Tình trạng/Tiểu sử: ${profile.bio || "Không có ghi chú"}`
    : "Không có thông tin cá nhân.";

  let prompt = "";

  if (type === "workout_plan_name") {
    prompt = `Dựa vào hồ sơ: "${bioInfo}". Hãy tạo ra 3 gợi ý TÊN cho một chương trình luyện tập (Workout Plan) phù hợp. Trả về dưới dạng danh sách gạch đầu dòng ngắn gọn.`;
  } else if (type === "workout_plan_desc") {
    prompt = `Dựa vào hồ sơ: "${bioInfo}" và tên chương trình: "${context.name || ""}". Hãy viết một GHI CHÚ/MÔ TẢ (khoảng 2-3 câu) giải thích cách thực hiện chương trình này. Dùng tiếng Việt tự nhiên, chuyên nghiệp.`;
  } else if (type === "session_notes") {
    prompt = `Dựa vào hồ sơ: "${bioInfo}" và tên buổi tập hiện tại: "${context.name || ""}". Hãy viết GHI CHÚ (notes) hoặc chiến thuật cho buổi tập này (khoảng 2-3 câu), ví dụ khuyên nên khởi động thế nào hoặc tập trung vào nhóm cơ nào. Dùng tiếng Việt ngắn gọn.`;
  } else if (type === "food_stats") {
    prompt = `Bạn là chuyên gia dinh dưỡng. Khi tôi đưa một món ăn: "${context.mealName}", hãy trả về chính xác 4 con số theo định dạng JSON: { "calories": X, "protein": Y, "carbs": Z, "fats": W }. 
    Lưu ý: 
    - Trả về JSON THUẦN, không giải thích gì thêm, không bọc trong markdown block.
    - Con số là số nguyên ước tính cho một khẩu phần thông thường (VD: 1 bát phở, 1 dĩa cơm tấm).
    - Đơn vị: calories (kcal), protein (g), carbs (g), fats (g).`;
  } else {
    prompt = `Hãy cho một lời khuyên ngắn gọn về tập luyện xoay quanh bối cảnh: ${JSON.stringify(context)}`;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const resData = await response.json();
    const suggestion = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ suggestion });
  } catch (error: any) {
    console.error("AI Suggestion Error:", error);
    return NextResponse.json(
      { error: "AI_SUGGESTION_FAILED", details: error.message },
      { status: 500 },
    );
  }
}
