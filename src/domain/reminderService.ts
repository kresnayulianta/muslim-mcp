import type { ReminderNeed, ReminderPriority } from "../types/reminder.js";
import { getDailySchedule } from "./prayerService.js";
import { timeToMinutes } from "../utils/time.js";

type StatusInput = {
  subuh_done: boolean;
  zuhur_done: boolean;
  asar_done: boolean;
  maghrib_done: boolean;
  isya_done: boolean;
  dhuha_done: boolean;
  quran_done: boolean;
  dzikir_pagi_done?: boolean;
  dzikir_petang_done?: boolean;
};

const PRIORITY_ORDER: Record<ReminderPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const PRAYER_NAMES = ["subuh", "zuhur", "asar", "maghrib", "isya"] as const;
type PrayerKey = (typeof PRAYER_NAMES)[number];

export async function evaluateReminderNeeds(
  date: string,
  time: string,
  timezone: string,
  province: string,
  city: string,
  status: StatusInput,
): Promise<{ date: string; time: string; reminders: ReminderNeed[] }> {
  const daily = await getDailySchedule({ province, city, date, timezone });
  const { schedule } = daily;

  const currentMins = timeToMinutes(time);
  const reminders: ReminderNeed[] = [];

  for (const prayer of PRAYER_NAMES) {
    const doneKey = `${prayer}_done` as keyof StatusInput;
    const isDone = status[doneKey];
    const prayerTime = schedule[prayer];
    const prayerMins = timeToMinutes(prayerTime);
    const diff = prayerMins - currentMins;

    if (!isDone) {
      if (diff <= 0) {
        // Prayer time has passed and not done
        reminders.push({
          type: "post_prayer_followup",
          target: prayer,
          priority: "high",
          message: `Waktu ${prayer} sudah lewat (${prayerTime}). Apakah sudah sholat?`,
        });
      } else if (diff <= 15) {
        // Prayer time is within 15 minutes
        reminders.push({
          type: "pre_prayer",
          target: prayer,
          priority: "high",
          message: `Waktu ${prayer} akan tiba dalam ${diff} menit (${prayerTime}). Bersiaplah!`,
        });
      }
    }
  }

  // Habit checks
  if (currentMins >= timeToMinutes("14:00") && !status.dhuha_done) {
    reminders.push({
      type: "habit_followup",
      target: "dhuha",
      priority: "low",
      message: "Jangan lupa sholat Dhuha hari ini.",
    });
  }

  if (currentMins >= timeToMinutes("20:00") && !status.quran_done) {
    reminders.push({
      type: "habit_followup",
      target: "quran",
      priority: "medium",
      message: "Sudahkah membaca Al-Quran hari ini?",
    });
  }

  // Deduplicate by type+target
  const seen = new Set<string>();
  const deduplicated = reminders.filter((r) => {
    const key = `${r.type}:${r.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by priority descending
  deduplicated.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);

  return { date, time, reminders: deduplicated };
}
