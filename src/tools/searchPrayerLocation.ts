import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchLocation } from "../domain/prayerService.js";

export function register(server: McpServer): void {
  server.tool(
    "search-prayer-location",
    "Search for Indonesian cities/provinces supported by the prayer schedule provider",
    {
      query: z.string().describe("Search query, e.g. Jakarta, Bandung, Jawa Barat"),
    },
    async (args) => {
      try {
        const result = await searchLocation({ query: args.query });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
