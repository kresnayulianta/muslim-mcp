import dayjs from "dayjs";
import type { FastingContext, FastingType } from "../../types/fasting.js";

export function getFastingContext(date: string): FastingContext {
  const d = dayjs(date);
  const dayOfWeek = d.day(); // 0=Sun, 1=Mon, ..., 4=Thu
  const dayOfMonth = d.date();

  const types: FastingType[] = [];
  const notes: string[] = [];

  // Senin = 1, Kamis = 4
  if (dayOfWeek === 1) {
    types.push("senin");
    notes.push("Hari ini termasuk hari Senin.");
  }
  if (dayOfWeek === 4) {
    types.push("kamis");
    notes.push("Hari ini termasuk hari Kamis.");
  }

  // Ayyamul Bidh: 13, 14, 15 of Hijri month
  // For v1 approximation: use day 13, 14, 15 of Gregorian month as a placeholder
  if ([13, 14, 15].includes(dayOfMonth)) {
    types.push("ayyamul_bidh");
    notes.push(
      "Hari ini kemungkinan termasuk Ayyamul Bidh (perkiraan berbasis Gregorian, verifikasi dengan kalender Hijriah).",
    );
  }

  return {
    date,
    is_recommended_fasting_day: types.length > 0,
    fasting_types: types,
    notes,
  };
}
