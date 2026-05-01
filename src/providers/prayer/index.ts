import { config } from "../../config.js";
import type {
  LocationSearchResult,
  PrayerMonthlyRequest,
  PrayerMonthlyResult,
  PrayerScheduleRequest,
  PrayerScheduleResult,
  SearchLocationRequest,
} from "../../types/prayer.js";
import { FallbackProvider } from "./fallbackProvider.js";
import { KemenagHtmlProvider } from "./kemenagHtmlProvider.js";
import { ProviderError, type PrayerScheduleProvider } from "./types.js";

export type { PrayerScheduleProvider } from "./types.js";
export { ProviderError } from "./types.js";

class CompositeProvider implements PrayerScheduleProvider {
  constructor(
    private primary: PrayerScheduleProvider,
    private fallback: PrayerScheduleProvider,
  ) {}

  async getDailySchedule(input: PrayerScheduleRequest): Promise<PrayerScheduleResult> {
    try {
      return await this.primary.getDailySchedule(input);
    } catch (err) {
      console.warn("[CompositeProvider] Primary failed, trying fallback:", err);
      return this.fallback.getDailySchedule(input);
    }
  }

  async getMonthlySchedule(input: PrayerMonthlyRequest): Promise<PrayerMonthlyResult> {
    try {
      return await this.primary.getMonthlySchedule(input);
    } catch (err) {
      console.warn("[CompositeProvider] Primary failed, trying fallback:", err);
      return this.fallback.getMonthlySchedule(input);
    }
  }

  async searchLocation(input: SearchLocationRequest): Promise<LocationSearchResult> {
    try {
      return await this.primary.searchLocation(input);
    } catch (err) {
      console.warn("[CompositeProvider] Primary failed, trying fallback:", err);
      return this.fallback.searchLocation(input);
    }
  }
}

let _instance: PrayerScheduleProvider | null = null;

export function createPrayerProvider(): PrayerScheduleProvider {
  if (_instance) return _instance;

  const primary = new KemenagHtmlProvider();

  if (config.enableFallbackProvider) {
    const fallback = new FallbackProvider();
    _instance = new CompositeProvider(primary, fallback);
  } else {
    _instance = primary;
  }

  return _instance;
}

// Re-export error type for consumers
export { ProviderError as PrayerProviderError };
