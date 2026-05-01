import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getFastingContext } from "../domain/fastingService.js";

export function register(server: McpServer): void {
  server.tool(
    "get-fasting-context",
    "Get fasting context and recommendations for a given date based on Islamic fasting rules",
    {
      date: z.string().describe("Date in YYYY-MM-DD format"),
      timezone: z.string().default("Asia/Jakarta").describe("Timezone, e.g. Asia/Jakarta"),
    },
    async (args) => {
      try {
        const result = getFastingContext(args.date);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
