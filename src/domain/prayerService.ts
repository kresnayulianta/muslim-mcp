import dayjs from "dayjs";
import { createPrayerProvider } from "../providers/prayer/index.js";
import type {
  LocationSearchResult,
  PrayerMonthlyRequest,
  PrayerMonthlyResult,
  PrayerScheduleRequest,
  PrayerScheduleResult,
  SearchLocationRequest,
} from "../types/prayer.js";
import { minutesUntil } from "../utils/time.js";

const provider = createPrayerProvider();

export async function getDailySchedule(input: PrayerScheduleRequest): Promise<PrayerScheduleResult> {
  return provider.getDailySchedule(input);
}

export async function getMonthlySchedule(input: PrayerMonthlyRequest): Promise<PrayerMonthlyResult> {
  return provider.getMonthlySchedule(input);
}

export async function searchLocation(input: SearchLocationRequest): Promise<LocationSearchResult> {
  return provider.searchLocation(input);
}

type NextPrayerResult = {
  date: string;
  current_time: string;
  timezone: string;
  next_prayer: {
    name: string;
    time: string;
    minutes_until: number;
  };
};

const PRAYER_ORDER = ["subuh", "zuhur", "asar", "maghrib", "isya"] as const;
type OrderedPrayer = (typeof PRAYER_ORDER)[number];

export async function getNextPrayer(
  province: string,
  city: string,
  date: string,
  time: string,
  timezone: string,
): Promise<NextPrayerResult> {
  const daily = await getDailySchedule({ province, city, date, timezone });
  const { schedule } = daily;

  for (const prayer of PRAYER_ORDER) {
    const prayerTime = schedule[prayer];
    const mins = minutesUntil(time, prayerTime);
    if (mins > 0) {
      return {
        date,
        current_time: time,
        timezone,
        next_prayer: {
          name: prayer,
          time: prayerTime,
          minutes_until: mins,
        },
      };
    }
  }

  // All prayers passed for today — get subuh of next day
  const nextDateStr = dayjs(date).add(1, "day").format("YYYY-MM-DD");
  const nextDaily = await getDailySchedule({ province, city, date: nextDateStr, timezone });
  const subuhTomorrow = nextDaily.schedule.subuh;

  // Minutes from current time to midnight + minutes from midnight to next subuh
  const [ch, cm] = time.split(":").map(Number);
  const currentMins = (ch ?? 0) * 60 + (cm ?? 0);
  const [sh, sm] = subuhTomorrow.split(":").map(Number);
  const subuhMins = (sh ?? 0) * 60 + (sm ?? 0);
  const minutesUntilSubuh = 24 * 60 - currentMins + subuhMins;

  return {
    date: nextDateStr,
    current_time: time,
    timezone,
    next_prayer: {
      name: "subuh_besok",
      time: subuhTomorrow,
      minutes_until: minutesUntilSubuh,
    },
  };
}
