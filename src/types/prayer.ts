export type PrayerName = "imsak" | "subuh" | "terbit" | "dhuha" | "zuhur" | "asar" | "maghrib" | "isya";
export type PrayerSchedule = Record<PrayerName, string>;

export type PrayerScheduleRequest = {
  province: string;
  city: string;
  date: string; // YYYY-MM-DD
  timezone: string;
};

export type PrayerScheduleResult = {
  provider: string;
  province: string;
  city: string;
  date: string;
  timezone: string;
  schedule: PrayerSchedule;
};

export type PrayerMonthlyRequest = {
  province: string;
  city: string;
  month: number;
  year: number;
  timezone: string;
};

export type DailyScheduleEntry = {
  date: string;
  schedule: PrayerSchedule;
};

export type PrayerMonthlyResult = {
  provider: string;
  province: string;
  city: string;
  month: number;
  year: number;
  days: DailyScheduleEntry[];
};

export type SearchLocationRequest = { query: string };
export type LocationMatch = { province: string; city: string; provider: string };
export type LocationSearchResult = { query: string; matches: LocationMatch[] };
