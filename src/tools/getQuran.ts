import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const ALQURAN_BASE = "https://api.alquran.cloud/v1";
const ARABIC_EDITION = "quran-uthmani";
const ID_EDITION = "id.indonesian";

type AyahRaw = {
  number: number;
  numberInSurah: number;
  text: string;
  surah?: { number: number; name: string; englishName: string; numberOfAyahs: number };
};

type SurahRaw = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  ayahs: AyahRaw[];
};

type EditionResponse = { data: { ayahs: AyahRaw[]; englishName: string; name: string; number: number; numberOfAyahs: number } };

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${ALQURAN_BASE}${path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Al-Quran API error ${res.status}: ${path}`);
  const json = await res.json() as { code: number; data: T };
  if (json.code !== 200) throw new Error(`Al-Quran API returned code ${json.code}`);
  return json.data;
}

/** Merge Arabic + Indonesian ayahs into formatted output */
function mergeAyahs(arabicAyahs: AyahRaw[], idAyahs: AyahRaw[]) {
  return arabicAyahs.map((a, i) => ({
    ayah: a.numberInSurah,
    arabic: a.text,
    indonesian: idAyahs[i]?.text ?? "",
  }));
}

export function register(server: McpServer): void {
  // ── get-surah ──────────────────────────────────────────────────────────────
  server.tool(
    "get-surah",
    "Get a full Quran surah with Arabic text and Indonesian translation. Accepts surah number (1-114).",
    {
      surah: z.number().int().min(1).max(114).describe("Surah number (1-114)"),
    },
    async ({ surah }) => {
      try {
        const [arabic, indonesian] = await Promise.all([
          fetchJson<EditionResponse["data"]>(`/surah/${surah}/${ARABIC_EDITION}`),
          fetchJson<EditionResponse["data"]>(`/surah/${surah}/${ID_EDITION}`),
        ]);

        const result = {
          surah: arabic.number,
          name_arabic: arabic.name,
          name: arabic.englishName,
          total_ayahs: arabic.numberOfAyahs,
          ayahs: mergeAyahs(arabic.ayahs, indonesian.ayahs),
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── get-ayah ───────────────────────────────────────────────────────────────
  server.tool(
    "get-ayah",
    "Get a specific Quran ayah with Arabic text and Indonesian translation. E.g. surah=2, ayah=255 for Ayat Kursi.",
    {
      surah: z.number().int().min(1).max(114).describe("Surah number (1-114)"),
      ayah: z.number().int().min(1).describe("Ayah number within the surah"),
    },
    async ({ surah, ayah }) => {
      try {
        type AyahEditionData = { text: string; surah: { number: number; name: string; englishName: string; numberOfAyahs: number }; numberInSurah: number; number: number };
        const [arabic, indonesian] = await Promise.all([
          fetchJson<AyahEditionData>(`/ayah/${surah}:${ayah}/${ARABIC_EDITION}`),
          fetchJson<AyahEditionData>(`/ayah/${surah}:${ayah}/${ID_EDITION}`),
        ]);

        const result = {
          reference: `QS. ${arabic.surah.englishName}: ${arabic.numberInSurah}`,
          surah_name_arabic: arabic.surah.name,
          arabic: arabic.text,
          indonesian: indonesian.text,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── get-juz ────────────────────────────────────────────────────────────────
  server.tool(
    "get-juz",
    "Get all ayahs in a Quran juz (1-30) with Arabic and Indonesian translation.",
    {
      juz: z.number().int().min(1).max(30).describe("Juz number (1-30)"),
    },
    async ({ juz }) => {
      try {
        type JuzData = { ayahs: AyahRaw[] };
        const [arabic, indonesian] = await Promise.all([
          fetchJson<JuzData>(`/juz/${juz}/${ARABIC_EDITION}`),
          fetchJson<JuzData>(`/juz/${juz}/${ID_EDITION}`),
        ]);

        const ayahs = arabic.ayahs.map((a, i) => ({
          surah: a.surah?.number,
          surah_name: a.surah?.englishName,
          ayah: a.numberInSurah,
          arabic: a.text,
          indonesian: indonesian.ayahs[i]?.text ?? "",
        }));

        const result = {
          juz,
          total_ayahs: ayahs.length,
          ayahs,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── search-quran ───────────────────────────────────────────────────────────
  server.tool(
    "search-quran",
    "Search the Quran by keyword in Indonesian translation. Returns matching ayahs with Arabic and Indonesian text.",
    {
      query: z.string().describe("Keyword to search in Indonesian translation"),
      surah: z.number().int().min(1).max(114).optional().describe("Limit search to a specific surah (optional)"),
    },
    async ({ query, surah }) => {
      try {
        type SearchData = { count: number; matches: AyahRaw[] };
        const path = surah
          ? `/search/${encodeURIComponent(query)}/${surah}/${ID_EDITION}`
          : `/search/${encodeURIComponent(query)}/all/${ID_EDITION}`;

        const data = await fetchJson<SearchData>(path);

        if (data.count === 0) {
          return { content: [{ type: "text", text: JSON.stringify({ query, count: 0, matches: [] }) }] };
        }

        // Fetch Arabic for matched ayahs (up to 10 results)
        const limited = data.matches.slice(0, 10);
        const arabicResults = await Promise.all(
          limited.map((m) =>
            fetchJson<{ text: string; surah: { name: string; englishName: string }; numberInSurah: number }>(
              `/ayah/${m.surah?.number ?? 1}:${m.numberInSurah}/${ARABIC_EDITION}`
            ).catch(() => ({ text: "", surah: { name: "", englishName: "" }, numberInSurah: m.numberInSurah }))
          )
        );

        const matches = limited.map((m, i) => ({
          reference: `QS. ${m.surah?.englishName ?? ""}: ${m.numberInSurah}`,
          surah_name_arabic: m.surah?.name ?? "",
          arabic: arabicResults[i]?.text ?? "",
          indonesian: m.text,
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ query, count: data.count, shown: matches.length, matches }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── get-daily-ayah ─────────────────────────────────────────────────────────
  server.tool(
    "get-daily-ayah",
    "Get the Quran ayah of the day. Deterministic based on date — same ayah all day. Great for daily reminders.",
    {
      date: z.string().optional().describe("Date in YYYY-MM-DD format. Defaults to today."),
    },
    async ({ date }) => {
      try {
        const dateStr = date ?? new Date().toISOString().slice(0, 10);

        // Deterministic ayah selection from 6236 total ayahs
        const TOTAL_AYAHS = 6236;
        const hash = dateStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const globalAyahNumber = (hash % TOTAL_AYAHS) + 1;

        type AyahByNumberData = { text: string; surah: { number: number; name: string; englishName: string; numberOfAyahs: number }; numberInSurah: number; number: number };
        const [arabic, indonesian] = await Promise.all([
          fetchJson<AyahByNumberData>(`/ayah/${globalAyahNumber}/${ARABIC_EDITION}`),
          fetchJson<AyahByNumberData>(`/ayah/${globalAyahNumber}/${ID_EDITION}`),
        ]);

        const result = {
          date: dateStr,
          reference: `QS. ${arabic.surah.englishName} (${arabic.surah.name}): ${arabic.numberInSurah}`,
          arabic: arabic.text,
          indonesian: indonesian.text,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── list-surahs ────────────────────────────────────────────────────────────
  server.tool(
    "list-surahs",
    "List all 114 Quran surahs with their names (Arabic and English) and number of ayahs.",
    {},
    async () => {
      try {
        const data = await fetchJson<SurahRaw[]>("/surah");
        const surahs = data.map((s) => ({
          number: s.number,
          name_arabic: s.name,
          name: s.englishName,
          meaning: s.englishNameTranslation,
          total_ayahs: s.numberOfAyahs,
        }));
        return { content: [{ type: "text", text: JSON.stringify(surahs, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );
}
