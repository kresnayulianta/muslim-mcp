import type {
  PrayerScheduleRequest,
  PrayerScheduleResult,
  PrayerMonthlyRequest,
  PrayerMonthlyResult,
  SearchLocationRequest,
  LocationSearchResult,
} from "../../types/prayer.js";

export interface PrayerScheduleProvider {
  getDailySchedule(input: PrayerScheduleRequest): Promise<PrayerScheduleResult>;
  getMonthlySchedule(input: PrayerMonthlyRequest): Promise<PrayerMonthlyResult>;
  searchLocation(input: SearchLocationRequest): Promise<LocationSearchResult>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
