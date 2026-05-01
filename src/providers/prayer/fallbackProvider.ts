import type {
  LocationSearchResult,
  PrayerMonthlyRequest,
  PrayerMonthlyResult,
  PrayerScheduleRequest,
  PrayerScheduleResult,
  SearchLocationRequest,
} from "../../types/prayer.js";
import { ProviderError, type PrayerScheduleProvider } from "./types.js";

export class FallbackProvider implements PrayerScheduleProvider {
  async getDailySchedule(_input: PrayerScheduleRequest): Promise<PrayerScheduleResult> {
    throw new ProviderError("Fallback provider not configured", "fallback");
  }

  async getMonthlySchedule(_input: PrayerMonthlyRequest): Promise<PrayerMonthlyResult> {
    throw new ProviderError("Fallback provider not configured", "fallback");
  }

  async searchLocation(_input: SearchLocationRequest): Promise<LocationSearchResult> {
    throw new ProviderError("Fallback provider not configured", "fallback");
  }
}
