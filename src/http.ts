import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as getPrayerSchedule from "./tools/getPrayerSchedule.js";
import * as getPrayerScheduleMonth from "./tools/getPrayerScheduleMonth.js";
import * as getNextPrayer from "./tools/getNextPrayer.js";
import * as getFastingContext from "./tools/getFastingContext.js";
import * as generateDailyChecklist from "./tools/generateDailyChecklist.js";
import * as evaluateReminderNeeds from "./tools/evaluateReminderNeeds.js";
import * as searchPrayerLocation from "./tools/searchPrayerLocation.js";
import * as getIslamicQuote from "./tools/getIslamicQuote.js";
import * as getOptionalPrayerTimes from "./tools/getOptionalPrayerTimes.js";
import * as getQuran from "./tools/getQuran.js";
import * as tadarusTracker from "./tools/tadarusTracker.js";
import * as hijriCalendar from "./tools/hijriCalendar.js";

function createServer(): McpServer {
  const server = new McpServer({ name: "muslim-mcp", version: "1.0.0" });

  getPrayerSchedule.register(server);
  getPrayerScheduleMonth.register(server);
  getNextPrayer.register(server);
  getFastingContext.register(server);
  generateDailyChecklist.register(server);
  evaluateReminderNeeds.register(server);
  searchPrayerLocation.register(server);
  getIslamicQuote.register(server);
  getOptionalPrayerTimes.register(server);
  getQuran.register(server);
  tadarusTracker.register(server);
  hijriCalendar.register(server);

  // ── Resources ────────────────────────────────────────────────
  server.resource(
    "capabilities",
    "ibadah://capabilities",
    { description: "Ibadah MCP server capabilities and available tools" },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify({
          service: "muslim-mcp",
          description: "Islamic prayer schedules, fasting context, and daily ibadah tools for Indonesia",
          defaultTimezone: process.env.DEFAULT_TIMEZONE ?? "Asia/Jakarta",
          tools: [
            { name: "search-prayer-location", description: "Search for a province/city to use in prayer schedule queries" },
            { name: "get-prayer-schedule", description: "Get daily prayer schedule for a specific city and date" },
            { name: "get-prayer-schedule-month", description: "Get monthly prayer schedule for a specific city" },
            { name: "get-next-prayer", description: "Get the next upcoming prayer and countdown" },
            { name: "get-fasting-context", description: "Get fasting context for today (Ramadan, Senin/Kamis, etc.)" },
            { name: "generate-daily-checklist", description: "Generate a daily ibadah checklist with recommended actions" },
            { name: "evaluate-reminder-needs", description: "Evaluate whether a prayer reminder should be triggered" },
          ],
        }),
      }],
    })
  );

  // ── Prompts ──────────────────────────────────────────────────
  server.prompt(
    "prayer-times",
    "Get today's prayer times for a city in Indonesia",
    async () => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: 'Use the get-prayer-schedule tool to fetch today\'s prayer times. First use search-prayer-location if the city code is unknown. Return Subuh, Zhuhr, Ashar, Maghrib, and Isya times clearly formatted.',
        },
      }],
    })
  );

  server.prompt(
    "daily-ibadah",
    "Generate a daily ibadah checklist including prayer times and fasting status",
    async () => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: "Use generate-daily-checklist to get today's ibadah checklist, and get-fasting-context to check fasting status. Combine both into a clear daily ibadah summary.",
        },
      }],
    })
  );

  return server;
}

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.MCP_HTTP_PORT ?? "3002", 10);
const MCP_API_KEY = process.env.MCP_API_KEY;

function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (!MCP_API_KEY) { next(); return; }
  const auth = req.headers["authorization"];
  const fromBearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const fromHeader = req.headers["x-api-key"];
  const provided = fromBearer ?? (Array.isArray(fromHeader) ? fromHeader[0] : fromHeader);
  if (provided !== MCP_API_KEY) {
    res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
    return;
  }
  next();
}

app.use("/mcp", requireApiKey);

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { server.close().catch(console.error); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { server.close().catch(console.error); });
  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  res.status(405).json({ error: "Method not supported in stateless mode" });
});

app.get("/health", (_req, res) => { res.json({ ok: true, service: "muslim-mcp" }); });

app.listen(PORT, () => {
  console.log(`muslim-mcp HTTP server listening on :${PORT}`);
});
