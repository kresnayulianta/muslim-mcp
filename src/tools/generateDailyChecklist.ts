import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateDailyChecklist } from "../domain/checklistService.js";

export function register(server: McpServer): void {
  server.tool(
    "generate-daily-checklist",
    "Generate a daily ibadah checklist for a given date and location",
    {
      date: z.string().describe("Date in YYYY-MM-DD format"),
      province: z.string().describe("Province name, e.g. DKI Jakarta"),
      city: z.string().describe("City name, e.g. Kota Jakarta Selatan"),
      timezone: z.string().default("Asia/Jakarta").describe("Timezone, e.g. Asia/Jakarta"),
      include_optional: z.boolean().default(true).describe("Include optional ibadah like Dhuha, Quran"),
    },
    async (args) => {
      try {
        const result = await generateDailyChecklist(
          args.province,
          args.city,
          args.date,
          args.timezone,
          args.include_optional,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
