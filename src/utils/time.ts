import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";

dayjs.extend(customParseFormat);
dayjs.extend(duration);

/** Parse HH:MM string and combine with date string to get a dayjs object */
export function parsePrayerTime(date: string, time: string, _timezone: string): dayjs.Dayjs {
  // Returns dayjs of combined date+time, treating it as local time in given TZ
  return dayjs(`${date}T${time}:00`);
}

/** Compute minutes until target time string "HH:MM" from current time string "HH:MM" */
export function minutesUntil(currentTime: string, targetTime: string): number {
  const [ch, cm] = currentTime.split(":").map(Number);
  const [th, tm] = targetTime.split(":").map(Number);
  const currentMinutes = (ch ?? 0) * 60 + (cm ?? 0);
  const targetMinutes = (th ?? 0) * 60 + (tm ?? 0);
  return targetMinutes - currentMinutes;
}

/** Parse HH:MM to total minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
