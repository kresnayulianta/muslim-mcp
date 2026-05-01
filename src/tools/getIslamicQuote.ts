import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ISLAMIC_QUOTES,
  getDailyQuote,
  getQuotesByTopic,
  type QuoteTopic,
} from "../data/islamicQuotes.js";

const VALID_TOPICS = [
  "sabar", "syukur", "tawakkal", "ibadah", "dhuha", "tahajjud",
  "sedekah", "ilmu", "akhlak", "taubat", "rezeki", "motivasi",
] as const;

export function register(server: McpServer): void {
  server.tool(
    "get-islamic-quote",
    "Get an Islamic quote (hadith or Quran verse) in Arabic and Indonesian. Returns a daily quote by default (deterministic per date), or filter by topic.",
    {
      date: z.string().optional().describe(
        "Date in YYYY-MM-DD format to get the quote of the day. If omitted, returns a random quote."
      ),
      topic: z.enum(VALID_TOPICS).optional().describe(
        "Filter quotes by topic: sabar, syukur, tawakkal, ibadah, dhuha, tahajjud, sedekah, ilmu, akhlak, taubat, rezeki, motivasi"
      ),
      count: z.number().int().min(1).max(5).optional().describe(
        "Number of quotes to return when filtering by topic (1-5, default 1)"
      ),
    },
    async ({ date, topic, count = 1 }) => {
      try {
        let quotes;

        if (topic) {
          quotes = getQuotesByTopic(topic as QuoteTopic, count);
          if (quotes.length === 0) {
            return {
              content: [{ type: "text", text: `Tidak ada kutipan untuk topik: ${topic}` }],
              isError: true,
            };
          }
        } else {
          const q = getDailyQuote(date);
          quotes = [q];
        }

        const result = quotes.map((q) => ({
          id: q.id,
          type: q.type,
          arabic: q.arabic,
          indonesian: q.indonesian,
          source: q.source,
          topics: q.topics,
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify(count === 1 && !topic ? result[0] : result, null, 2),
          }],
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

  server.tool(
    "list-islamic-quote-topics",
    "List all available topics for Islamic quotes with their quote counts.",
    {},
    async () => {
      const topicCounts = VALID_TOPICS.map((topic) => ({
        topic,
        count: ISLAMIC_QUOTES.filter((q) => q.topics.includes(topic as QuoteTopic)).length,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(topicCounts, null, 2) }],
      };
    }
  );
}
