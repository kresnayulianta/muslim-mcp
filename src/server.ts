import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

const server = new McpServer({
  name: "muslim-mcp",
  version: "1.0.0",
});

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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
