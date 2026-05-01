import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const DATA_DIR = process.env["TADARUS_DATA_DIR"] ?? "/app/data";
const TRACKER_FILE = join(DATA_DIR, "tadarus.json");
const TOTAL_JUZ = 30;

type TadarusSession = {
  date: string;      // YYYY-MM-DD
  juz?: number;
  surah?: number;
  ayah_start?: number;
  ayah_end?: number;
  notes?: string;
};

type TadarusData = {
  target_khatam: string | null;   // YYYY-MM-DD
  completed_juz: number[];        // list of juz numbers already completed
  sessions: TadarusSession[];
  last_updated: string;
};

async function loadData(): Promise<TadarusData> {
  if (!existsSync(TRACKER_FILE)) {
    return { target_khatam: null, completed_juz: [], sessions: [], last_updated: new Date().toISOString() };
  }
  const raw = await readFile(TRACKER_FILE, "utf-8");
  return JSON.parse(raw) as TadarusData;
}

async function saveData(data: TadarusData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  data.last_updated = new Date().toISOString();
  await writeFile(TRACKER_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function register(server: McpServer): void {
  // ── log-tadarus ────────────────────────────────────────────────────────────
  server.tool(
    "log-tadarus",
    "Log a Quran reading session. Mark a juz as completed or record which surah/ayah range you read today.",
    {
      date: z.string().optional().describe("Date in YYYY-MM-DD format. Defaults to today."),
      juz: z.number().int().min(1).max(30).optional().describe("Juz number completed (1-30)"),
      surah: z.number().int().min(1).max(114).optional().describe("Surah number read"),
      ayah_start: z.number().int().min(1).optional().describe("Starting ayah number"),
      ayah_end: z.number().int().min(1).optional().describe("Ending ayah number"),
      notes: z.string().optional().describe("Optional notes about the session"),
    },
    async ({ date, juz, surah, ayah_start, ayah_end, notes }) => {
      try {
        const data = await loadData();
        const dateStr = date ?? new Date().toISOString().slice(0, 10);

        const session: TadarusSession = { date: dateStr };
        if (juz !== undefined) session.juz = juz;
        if (surah !== undefined) session.surah = surah;
        if (ayah_start !== undefined) session.ayah_start = ayah_start;
        if (ayah_end !== undefined) session.ayah_end = ayah_end;
        if (notes) session.notes = notes;

        data.sessions.push(session);

        if (juz !== undefined && !data.completed_juz.includes(juz)) {
          data.completed_juz.push(juz);
          data.completed_juz.sort((a, b) => a - b);
        }

        await saveData(data);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              logged: session,
              total_juz_completed: data.completed_juz.length,
              remaining_juz: TOTAL_JUZ - data.completed_juz.length,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── get-tadarus-progress ───────────────────────────────────────────────────
  server.tool(
    "get-tadarus-progress",
    "Get your current Quran tadarus (reading) progress: completed juz, remaining juz, recent sessions, and khatam estimate.",
    {
      recent_sessions: z.number().int().min(1).max(30).optional().describe("Number of recent sessions to show (default 7)"),
    },
    async ({ recent_sessions = 7 }) => {
      try {
        const data = await loadData();
        const completed = data.completed_juz.length;
        const remaining = TOTAL_JUZ - completed;

        // Estimate khatam date based on average pace
        let estimatedKhatam: string | null = null;
        if (data.sessions.length >= 2) {
          const dates = [...new Set(data.sessions.map((s) => s.date))].sort();
          const firstDate = new Date(dates[0]!);
          const lastDate = new Date(dates[dates.length - 1]!);
          const daysPassed = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / 86400000);
          const juzPerDay = completed / daysPassed;
          if (juzPerDay > 0) {
            const daysLeft = remaining / juzPerDay;
            const est = new Date(lastDate.getTime() + daysLeft * 86400000);
            estimatedKhatam = est.toISOString().slice(0, 10);
          }
        }

        const recentSessions = data.sessions.slice(-recent_sessions);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              completed_juz: data.completed_juz,
              total_completed: completed,
              remaining: remaining,
              percentage: Math.round((completed / TOTAL_JUZ) * 100),
              target_khatam: data.target_khatam,
              estimated_khatam: estimatedKhatam,
              recent_sessions: recentSessions,
              last_updated: data.last_updated,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── set-tadarus-target ─────────────────────────────────────────────────────
  server.tool(
    "set-tadarus-target",
    "Set a target khatam date for your Quran tadarus.",
    {
      target_date: z.string().describe("Target khatam date in YYYY-MM-DD format"),
    },
    async ({ target_date }) => {
      try {
        const data = await loadData();
        data.target_khatam = target_date;
        await saveData(data);

        const remaining = TOTAL_JUZ - data.completed_juz.length;
        const today = new Date();
        const target = new Date(target_date);
        const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000);
        const juzPerDay = daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : "N/A";

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              target_khatam: target_date,
              days_remaining: daysLeft,
              juz_remaining: remaining,
              required_pace: `${juzPerDay} juz/hari`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );

  // ── reset-tadarus ──────────────────────────────────────────────────────────
  server.tool(
    "reset-tadarus",
    "Reset all tadarus progress. Use when starting a new khatam cycle.",
    {
      confirm: z.literal(true).describe("Must be true to confirm reset"),
    },
    async ({ confirm: _ }) => {
      try {
        await saveData({ target_khatam: null, completed_juz: [], sessions: [], last_updated: new Date().toISOString() });
        return { content: [{ type: "text", text: JSON.stringify({ reset: true, message: "Tadarus progress has been reset. Bismillah, semoga khatam!" }) }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
      }
    }
  );
}
