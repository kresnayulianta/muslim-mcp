import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const BASE = "https://api.aladhan.com/v1";

async function aladhan<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Aladhan API error ${res.status}: ${path}`);
  const json = await res.json() as { code: number; status: string; data: T };
  if (json.code !== 200) throw new Error(`Aladhan error: ${json.status}`);
  return json.data;
}

function todayGregorian(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Notable Islamic events keyed by Hijri month (1-12) and day
const ISLAMIC_EVENTS: Record<string, string> = {
  "1-1":  "Tahun Baru Hijriyah (1 Muharram)",
  "1-10": "Hari Asyura (10 Muharram)",
  "3-12": "Maulid Nabi Muhammad SAW (12 Rabi'ul Awwal)",
  "7-27": "Isra Mi'raj (27 Rajab)",
  "8-15": "Nisfu Sya'ban (15 Sya'ban)",
  "9-1":  "Awal Ramadan",
  "9-17": "Nuzulul Qur'an (17 Ramadan)",
  "9-21": "Malam Lailatul Qadar (kemungkinan)",
  "9-23": "Malam Lailatul Qadar (kemungkinan)",
  "9-25": "Malam Lailatul Qadar (kemungkinan)",
  "9-27": "Malam Lailatul Qadar (kemungkinan)",
  "9-29": "Malam Lailatul Qadar (kemungkinan)",
  "10-1": "Idul Fitri (1 Syawal)",
  "12-9": "Hari Arafah (9 Dzulhijjah)",
  "12-10":"Idul Adha (10 Dzulhijjah)",
  "12-11":"Hari Tasyrik",
  "12-12":"Hari Tasyrik",
  "12-13":"Hari Tasyrik",
};

const HIJRI_MONTHS = [
  "Muharram","Safar","Rabi'ul Awwal","Rabi'ul Akhir",
  "Jumadil Awwal","Jumadil Akhir","Rajab","Sya'ban",
  "Ramadan","Syawal","Dzulqa'dah","Dzulhijjah",
];

export function register(server: McpServer): void {

  // ── get-hijri-date ──────────────────────────────────────────
  server.tool(
    "get-hijri-date",
    "Get the Hijri (Islamic) date for today or for a specific Gregorian date. Also returns the Hijri month name and any notable Islamic events on that day.",
    {
      date: z.string().optional().describe("Gregorian date in DD-MM-YYYY format. Omit for today."),
    },
    async ({ date }) => {
      try {
        const target = date ?? todayGregorian();
        const data = await aladhan<Record<string, unknown>>(`/gToH/${target}`);

        const hijri = data["hijri"] as Record<string, unknown>;
        const gregorian = data["gregorian"] as Record<string, unknown>;
        const hDay = Number(hijri["day"]);
        const hMonth = (hijri["month"] as Record<string, unknown>)["number"] as number;
        const hYear = Number(hijri["year"]);
        const hMonthAr = (hijri["month"] as Record<string, unknown>)["en"] as string;
        const hMonthId = HIJRI_MONTHS[hMonth - 1] ?? hMonthAr;
        const hWeekday = (hijri["weekday"] as Record<string, unknown>)["en"] as string;

        const eventKey = `${hMonth}-${hDay}`;
        const event = ISLAMIC_EVENTS[eventKey];

        const result = {
          gregorian: (gregorian["date"] as string),
          hijri: {
            date: `${hDay} ${hMonthId} ${hYear} H`,
            day: hDay,
            month: { number: hMonth, name: hMonthId, arabic: hMonthAr },
            year: hYear,
            weekday: hWeekday,
          },
          islamic_event: event ?? null,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    }
  );

  // ── hijri-to-gregorian ──────────────────────────────────────
  server.tool(
    "hijri-to-gregorian",
    "Convert a Hijri (Islamic) date to Gregorian date.",
    {
      date: z.string().describe("Hijri date in DD-MM-YYYY format, e.g. '01-09-1446' for 1 Ramadan 1446H"),
    },
    async ({ date }) => {
      try {
        const data = await aladhan<Record<string, unknown>>(`/hToG/${date}`);
        const hijri = data["hijri"] as Record<string, unknown>;
        const gregorian = data["gregorian"] as Record<string, unknown>;

        const hMonth = (hijri["month"] as Record<string, unknown>)["number"] as number;
        const hDay = Number(hijri["day"]);
        const eventKey = `${hMonth}-${hDay}`;

        const result = {
          hijri: (hijri["date"] as string),
          gregorian: (gregorian["date"] as string),
          gregorian_formatted: `${(gregorian["weekday"] as Record<string, unknown>)["en"]}, ${(gregorian["day"] as string)} ${(gregorian["month"] as Record<string, unknown>)["en"]} ${(gregorian["year"] as string)}`,
          islamic_event: ISLAMIC_EVENTS[eventKey] ?? null,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    }
  );

  // ── get-hijri-calendar ──────────────────────────────────────
  server.tool(
    "get-hijri-calendar",
    "Get the full Hijri calendar for a Gregorian month, showing both Hijri and Gregorian dates for each day, with Islamic events highlighted.",
    {
      month: z.number().int().min(1).max(12).optional().describe("Gregorian month (1-12). Defaults to current month."),
      year: z.number().int().optional().describe("Gregorian year, e.g. 2026. Defaults to current year."),
    },
    async ({ month, year }) => {
      try {
        const now = new Date();
        const m = month ?? (now.getMonth() + 1);
        const y = year ?? now.getFullYear();

        const data = await aladhan<Array<Record<string, unknown>>>(`/gToHCalendar/${m}/${y}`);

        const calendar = data.map((entry) => {
          const hijri = entry["hijri"] as Record<string, unknown>;
          const gregorian = entry["gregorian"] as Record<string, unknown>;
          const hDay = Number(hijri["day"]);
          const hMonth = (hijri["month"] as Record<string, unknown>)["number"] as number;
          const hMonthId = HIJRI_MONTHS[hMonth - 1] ?? (hijri["month"] as Record<string, unknown>)["en"] as string;
          const hYear = hijri["year"] as string;
          const eventKey = `${hMonth}-${hDay}`;

          return {
            gregorian: (gregorian["date"] as string),
            hijri: `${hDay} ${hMonthId} ${hYear}H`,
            event: ISLAMIC_EVENTS[eventKey] ?? null,
          };
        });

        const events = calendar.filter(d => d.event !== null);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ month: m, year: y, calendar, events_this_month: events }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    }
  );

  // ── get-islamic-events ──────────────────────────────────────
  server.tool(
    "get-islamic-events",
    "List all notable Islamic events/holidays for a given Hijri year, with their Gregorian date equivalents.",
    {
      hijri_year: z.number().int().optional().describe("Hijri year, e.g. 1446. Defaults to current Hijri year."),
    },
    async ({ hijri_year }) => {
      try {
        // Get current Hijri year if not provided
        let hYear = hijri_year;
        if (!hYear) {
          const todayData = await aladhan<Record<string, unknown>>(`/gToH/${todayGregorian()}`);
          hYear = Number((todayData["hijri"] as Record<string, unknown>)["year"]);
        }

        // Fetch all 12 Hijri months and find events
        const eventResults: Array<{ hijri: string; gregorian: string; event: string }> = [];

        for (const [key, eventName] of Object.entries(ISLAMIC_EVENTS)) {
          const [monthStr, dayStr] = key.split("-");
          const hMonth = monthStr!.padStart(2, "0");
          const hDay = dayStr!.padStart(2, "0");
          const hijriDate = `${hDay}-${hMonth}-${hYear}`;

          try {
            const data = await aladhan<Record<string, unknown>>(`/hToG/${hijriDate}`);
            const gregorian = data["gregorian"] as Record<string, unknown>;
            eventResults.push({
              hijri: hijriDate,
              gregorian: gregorian["date"] as string,
              event: eventName,
            });
          } catch {
            // skip if conversion fails (e.g. date out of range)
          }
        }

        // Sort by gregorian date
        eventResults.sort((a, b) => {
          const [da, ma, ya] = a.gregorian.split("-").map(Number) as [number, number, number];
          const [db, mb, yb] = b.gregorian.split("-").map(Number) as [number, number, number];
          return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ hijri_year: hYear, events: eventResults }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    }
  );
}
