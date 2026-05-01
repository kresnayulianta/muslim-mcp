import { config } from "../../config.js";
import type {
  DailyScheduleEntry,
  LocationSearchResult,
  PrayerMonthlyRequest,
  PrayerMonthlyResult,
  PrayerSchedule,
  PrayerScheduleRequest,
  PrayerScheduleResult,
  SearchLocationRequest,
} from "../../types/prayer.js";
import { fuzzyMatch } from "../../utils/text.js";
import { ProviderError, type PrayerScheduleProvider } from "./types.js";

type KnownLocation = {
  province: string;
  city: string;
  lat: number;
  lng: number;
};

const KNOWN_LOCATIONS: KnownLocation[] = [
  // DKI Jakarta
  { province: "DKI Jakarta", city: "Kota Jakarta Pusat", lat: -6.186, lng: 106.835 },
  { province: "DKI Jakarta", city: "Kota Jakarta Selatan", lat: -6.261, lng: 106.81 },
  { province: "DKI Jakarta", city: "Kota Jakarta Utara", lat: -6.121, lng: 106.9 },
  { province: "DKI Jakarta", city: "Kota Jakarta Barat", lat: -6.168, lng: 106.763 },
  { province: "DKI Jakarta", city: "Kota Jakarta Timur", lat: -6.215, lng: 106.9 },
  { province: "DKI Jakarta", city: "Kab. Kepulauan Seribu", lat: -5.6, lng: 106.571 },
  // Jawa Barat
  { province: "Jawa Barat", city: "Kota Bandung", lat: -6.914, lng: 107.609 },
  { province: "Jawa Barat", city: "Kota Bekasi", lat: -6.235, lng: 106.992 },
  { province: "Jawa Barat", city: "Kota Bogor", lat: -6.597, lng: 106.806 },
  { province: "Jawa Barat", city: "Kota Depok", lat: -6.402, lng: 106.794 },
  { province: "Jawa Barat", city: "Kota Cimahi", lat: -6.872, lng: 107.539 },
  // Jawa Timur
  { province: "Jawa Timur", city: "Kota Surabaya", lat: -7.257, lng: 112.752 },
  { province: "Jawa Timur", city: "Kota Malang", lat: -7.983, lng: 112.621 },
  { province: "Jawa Timur", city: "Kota Madiun", lat: -7.629, lng: 111.523 },
  // Jawa Tengah
  { province: "Jawa Tengah", city: "Kota Semarang", lat: -6.967, lng: 110.42 },
  { province: "Jawa Tengah", city: "Kota Solo", lat: -7.575, lng: 110.827 },
  { province: "Jawa Tengah", city: "Kota Yogyakarta", lat: -7.797, lng: 110.37 },
  // Banten
  { province: "Banten", city: "Kota Tangerang", lat: -6.178, lng: 106.63 },
  { province: "Banten", city: "Kota Tangerang Selatan", lat: -6.289, lng: 106.671 },
  { province: "Banten", city: "Kota Serang", lat: -6.12, lng: 106.15 },
  // Kalimantan Timur
  { province: "Kalimantan Timur", city: "Kota Samarinda", lat: -0.502, lng: 117.153 },
  { province: "Kalimantan Timur", city: "Kota Balikpapan", lat: -1.268, lng: 116.828 },
  // Sulawesi Selatan
  { province: "Sulawesi Selatan", city: "Kota Makassar", lat: -5.147, lng: 119.432 },
];

const DEFAULT_COORDS = { lat: -6.186, lng: 106.835 };
const ALADHAN_BASE = "https://api.aladhan.com/v1";
const KEMENAG_METHOD = 20; // Kementerian Agama RI (Fajr 20°, Isha 18°)

/** Strip timezone suffix that Aladhan sometimes appends, e.g. "04:13 (WIB)" → "04:13" */
function extractTime(t: string): string {
  return (t.split(" ")[0] ?? t).trim();
}

/** Add N minutes to a HH:MM string, returns HH:MM */
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + mins;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

type AladhanTimings = Record<string, string>;
type AladhanDayEntry = {
  timings: AladhanTimings;
  date: {
    gregorian: {
      date: string; // "DD-MM-YYYY"
      day: string;
      month: { number: number };
      year: string;
    };
  };
};
type AladhanCalendarResponse = { code: number; data: AladhanDayEntry[] };

function buildSchedule(timings: AladhanTimings): PrayerSchedule {
  const sunrise = extractTime(timings["Sunrise"] ?? "00:00");
  return {
    imsak: extractTime(timings["Imsak"] ?? "00:00"),
    subuh: extractTime(timings["Fajr"] ?? "00:00"),
    terbit: sunrise,
    dhuha: addMinutes(sunrise, 26),
    zuhur: extractTime(timings["Dhuhr"] ?? "00:00"),
    asar: extractTime(timings["Asr"] ?? "00:00"),
    maghrib: extractTime(timings["Maghrib"] ?? "00:00"),
    isya: extractTime(timings["Isha"] ?? "00:00"),
  };
}

type CacheEntry = {
  result: PrayerMonthlyResult;
  fetchedAt: number;
};

export class KemenagHtmlProvider implements PrayerScheduleProvider {
  private cache = new Map<string, CacheEntry>();

  private getCacheKey(province: string, city: string, month: number, year: number): string {
    return `${province}:${city}:${month}:${year}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    const ttlMs = config.cacheTtlMinutes * 60 * 1000;
    return Date.now() - entry.fetchedAt < ttlMs;
  }

  private findCoords(province: string, city: string): { lat: number; lng: number } {
    const loc = KNOWN_LOCATIONS.find(
      (l) => fuzzyMatch(l.province, province) && fuzzyMatch(l.city, city),
    );
    return loc ?? DEFAULT_COORDS;
  }

  async getMonthlySchedule(input: PrayerMonthlyRequest): Promise<PrayerMonthlyResult> {
    const { province, city, month, year, timezone } = input;
    const cacheKey = this.getCacheKey(province, city, month, year);

    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.result;
    }

    const { lat, lng } = this.findCoords(province, city);
    const tz = timezone ?? config.defaultTimezone;

    const url =
      `${ALADHAN_BASE}/calendar/${year}/${month}` +
      `?latitude=${lat}&longitude=${lng}&method=${KEMENAG_METHOD}&timezonestring=${encodeURIComponent(tz)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(config.httpTimeoutMs) });
    if (!res.ok) {
      throw new ProviderError(`Aladhan API error ${res.status} for ${city}`, "aladhan");
    }

    const json = (await res.json()) as AladhanCalendarResponse;
    if (!Array.isArray(json.data)) {
      throw new ProviderError("Aladhan returned unexpected response shape", "aladhan");
    }

    const days: DailyScheduleEntry[] = json.data.map((entry) => {
      const { day, month: { number: monthNum }, year: yr } = entry.date.gregorian;
      const dateStr = `${yr}-${String(monthNum).padStart(2, "0")}-${day.padStart(2, "0")}`;
      return { date: dateStr, schedule: buildSchedule(entry.timings) };
    });

    const result: PrayerMonthlyResult = {
      provider: "aladhan_kemenag",
      province,
      city,
      month,
      year,
      days,
    };

    this.cache.set(cacheKey, { result, fetchedAt: Date.now() });
    return result;
  }

  async getDailySchedule(input: PrayerScheduleRequest): Promise<PrayerScheduleResult> {
    const { province, city, date, timezone } = input;

    const [yr, mo] = date.split("-").map(Number);
    if (!yr || !mo) {
      throw new ProviderError(`Invalid date: ${date}`, "aladhan");
    }

    const monthly = await this.getMonthlySchedule({
      province,
      city,
      month: mo,
      year: yr,
      timezone,
    });

    const entry = monthly.days.find((d) => d.date === date);
    if (!entry) {
      throw new ProviderError(`No schedule found for date ${date}`, "aladhan");
    }

    return {
      provider: "aladhan_kemenag",
      province,
      city,
      date,
      timezone,
      schedule: entry.schedule,
    };
  }

  async searchLocation(input: SearchLocationRequest): Promise<LocationSearchResult> {
    const { query } = input;
    const matches = KNOWN_LOCATIONS.filter(
      (loc) => fuzzyMatch(loc.city, query) || fuzzyMatch(loc.province, query),
    ).map((loc) => ({
      province: loc.province,
      city: loc.city,
      provider: "aladhan_kemenag",
    }));

    return { query, matches };
  }
}
