export interface ExerciseNotesPayload {
  setsDetail?: any[];
  userNotes?: string | null;
}

export function parseExerciseNotes(notes: unknown) {
  if (!notes) return { setsDetail: null, userNotes: null };

  if (typeof notes === "string") {
    try {
      const parsed = JSON.parse(notes);
      if (parsed && typeof parsed === "object" && "setsDetail" in parsed) {
        const payload = parsed as ExerciseNotesPayload;
        return {
          setsDetail: Array.isArray(payload.setsDetail)
            ? payload.setsDetail
            : null,
          userNotes: payload.userNotes ?? null,
        };
      }
    } catch (err) {}

    return { setsDetail: null, userNotes: notes };
  }

  if (typeof notes === "object") {
    const payload = notes as ExerciseNotesPayload;
    return {
      setsDetail: Array.isArray(payload.setsDetail) ? payload.setsDetail : null,
      userNotes: payload.userNotes ?? null,
    };
  }

  return { setsDetail: null, userNotes: null };
}

export function buildExerciseNotes(setsDetail: any[], userNotes: string) {
  return {
    setsDetail,
    userNotes: userNotes.trim() || null,
  };
}
