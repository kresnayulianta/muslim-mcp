import type { DailyChecklist } from "../types/checklist.js";
import { getDailySchedule } from "./prayerService.js";
import { getFastingContext } from "./fastingService.js";

export async function generateDailyChecklist(
  province: string,
  city: string,
  date: string,
  timezone: string,
  includeOptional: boolean,
): Promise<{ date: string; province: string; city: string; checklist: DailyChecklist; schedule: Record<string, string> }> {
  const [daily, fasting] = await Promise.all([
    getDailySchedule({ province, city, date, timezone }),
    getFastingContext(date),
  ]);

  const fastingType =
    fasting.fasting_types.length > 0 ? fasting.fasting_types.join(", ") : null;

  const checklist: DailyChecklist = {
    subuh_done: false,
    zuhur_done: false,
    asar_done: false,
    maghrib_done: false,
    isya_done: false,
    dhuha_done: includeOptional ? false : false,
    quran_done: includeOptional ? false : false,
    dzikir_pagi_done: includeOptional ? false : false,
    dzikir_petang_done: includeOptional ? false : false,
    fasting_today: fasting.is_recommended_fasting_day,
    fasting_type: fastingType,
  };

  return {
    date,
    province,
    city,
    checklist,
    schedule: daily.schedule as Record<string, string>,
  };
}
