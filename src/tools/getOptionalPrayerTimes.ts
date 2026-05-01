import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createPrayerProvider } from "../providers/prayer/index.js";
import { config } from "../config.js";

/** Parse "HH:MM" → total minutes since midnight */
function toMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Format total minutes since midnight → "HH:MM" */
function fromMins(mins: number): string {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

export function register(server: McpServer): void {
  server.tool(
    "get-optional-prayer-times",
    "Get recommended times for optional (sunnah) prayers: Dhuha and Sholat Malam (Tahajjud + Witir) based on the daily prayer schedule.",
    {
      province: z.string().describe("Province name, e.g. 'Jawa Timur'"),
      city: z.string().describe("City name, e.g. 'Kota Surabaya'"),
      date: z.string().describe("Date in YYYY-MM-DD format"),
      timezone: z.string().optional().describe("Timezone (default: Asia/Jakarta)"),
    },
    async ({ province, city, date, timezone }) => {
      try {
        const provider = createPrayerProvider();
        const tz = timezone ?? config.defaultTimezone;

        const result = await provider.getDailySchedule({ province, city, date, timezone: tz });
        const s = result.schedule;

        // ── Dhuha ─────────────────────────────────────────────────────────
        // Start: 15 minutes after sunrise (terbit)
        // Best : midpoint between terbit and Zuhur
        // End  : 20 minutes before Zuhur
        const terbitMins = toMins(s.terbit);
        const zuhurMins  = toMins(s.zuhur);

        const dhuhaStart = terbitMins + 15;
        const dhuhaBest  = Math.round((terbitMins + zuhurMins) / 2);
        const dhuhaEnd   = zuhurMins - 20;

        // ── Sholat Malam ──────────────────────────────────────────────────
        // Night span: Isha → Subuh (may cross midnight)
        let ishaMins  = toMins(s.isya);
        let subuhMins = toMins(s.subuh);
        let imsakMins = toMins(s.imsak);

        // If subuh < isha, it crosses midnight — add 24h to subuh/imsak
        if (subuhMins <= ishaMins) subuhMins += 1440;
        if (imsakMins <= ishaMins) imsakMins += 1440;

        const nightDuration    = subuhMins - ishaMins;
        const lastThirdStart   = ishaMins + Math.round((nightDuration * 2) / 3);
        const tahajjudEnd      = imsakMins - 5; // 5 min buffer before imsak

        // Midnight (half of night) — for those who pray Witir early
        const midnight         = ishaMins + Math.round(nightDuration / 2);

        const response = {
          date,
          city,
          province,
          dhuha: {
            start: fromMins(dhuhaStart),
            best: fromMins(dhuhaBest),
            end: fromMins(dhuhaEnd),
            duration_minutes: dhuhaEnd - dhuhaStart,
            recommended_rakaat: "2 rakaat (minimum), 4, 8, atau 12 rakaat",
            note: "Waktu terbaik adalah pertengahan antara terbit dan Zuhur. Minimal 2 rakaat, salam tiap 2 rakaat.",
          },
          sholat_malam: {
            tahajjud: {
              sepertiga_malam_terakhir: fromMins(lastThirdStart),
              end: fromMins(tahajjudEnd),
              note: "Waktu terbaik Tahajjud adalah sepertiga malam terakhir. Tidur dulu setelah Isya, kemudian bangun.",
              recommended_rakaat: "2-8 rakaat (salam tiap 2 rakaat)",
            },
            witir: {
              window_start: s.isya,
              window_end: fromMins(imsakMins - 5),
              note: "Witir bisa dilakukan setelah Isya atau setelah Tahajjud. Minimal 1 rakaat, terbaik 3 atau 11 rakaat.",
              recommended_rakaat: "1, 3, 5, 7, atau 11 rakaat",
            },
            midnight: fromMins(midnight),
          },
          base_schedule: {
            terbit: s.terbit,
            zuhur: s.zuhur,
            isya: s.isya,
            imsak: s.imsak,
            subuh: s.subuh,
          },
        };

        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
