import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMonthlySchedule } from "../domain/prayerService.js";

export function register(server: McpServer): void {
  server.tool(
    "get-prayer-schedule-month",
    "Get monthly prayer schedule for a location in Indonesia from Kemenag",
    {
      province: z.string().describe("Province name, e.g. DKI Jakarta"),
      city: z.string().describe("City name, e.g. Kota Jakarta Selatan"),
      month: z.number().int().min(1).max(12).describe("Month number (1-12)"),
      year: z.number().int().min(2000).describe("Year, e.g. 2025"),
      timezone: z.string().default("Asia/Jakarta").describe("Timezone, e.g. Asia/Jakarta"),
    },
    async (args) => {
      try {
        const result = await getMonthlySchedule(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
