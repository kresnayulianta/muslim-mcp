import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getNextPrayer } from "../domain/prayerService.js";

export function register(server: McpServer): void {
  server.tool(
    "get-next-prayer",
    "Get the next upcoming prayer time from the current time for a location in Indonesia",
    {
      province: z.string().describe("Province name, e.g. DKI Jakarta"),
      city: z.string().describe("City name, e.g. Kota Jakarta Selatan"),
      date: z.string().describe("Current date in YYYY-MM-DD format"),
      time: z.string().describe("Current time in HH:MM format"),
      timezone: z.string().default("Asia/Jakarta").describe("Timezone, e.g. Asia/Jakarta"),
    },
    async (args) => {
      try {
        const result = await getNextPrayer(args.province, args.city, args.date, args.time, args.timezone);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
