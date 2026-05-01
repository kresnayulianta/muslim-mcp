import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { evaluateReminderNeeds } from "../domain/reminderService.js";

export function register(server: McpServer): void {
  server.tool(
    "evaluate-reminder-needs",
    "Evaluate which ibadah reminders are needed based on current time and completion status",
    {
      date: z.string().describe("Current date in YYYY-MM-DD format"),
      time: z.string().describe("Current time in HH:MM format"),
      timezone: z.string().default("Asia/Jakarta").describe("Timezone, e.g. Asia/Jakarta"),
      province: z.string().describe("Province name, e.g. DKI Jakarta"),
      city: z.string().describe("City name, e.g. Kota Jakarta Selatan"),
      status: z.object({
        subuh_done: z.boolean().default(false),
        zuhur_done: z.boolean().default(false),
        asar_done: z.boolean().default(false),
        maghrib_done: z.boolean().default(false),
        isya_done: z.boolean().default(false),
        dhuha_done: z.boolean().default(false),
        quran_done: z.boolean().default(false),
      }).describe("Ibadah completion status"),
    },
    async (args) => {
      try {
        const result = await evaluateReminderNeeds(
          args.date,
          args.time,
          args.timezone,
          args.province,
          args.city,
          args.status,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
