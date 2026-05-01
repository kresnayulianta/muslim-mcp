#!/usr/bin/env node
import { parseArgs } from "node:util";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    http: { type: "boolean", default: false },
    port: { type: "string", default: "3002" },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.error([
    "Usage: muslim-mcp [options]",
    "",
    "Options:",
    "  --http        Start HTTP server instead of stdio",
    "  --port <n>    HTTP port (default: 3002)",
    "  -h, --help    Show help",
    "",
    "Examples:",
    "  muslim-mcp                      # stdio mode",
    "  muslim-mcp --http --port 3002   # HTTP server mode",
  ].join("\n"));
  process.exit(0);
}

if (values.http) {
  process.env.MCP_HTTP_PORT = values.port as string;
  await import("./http.js");
} else {
  await import("./server.js");
}
