import "dotenv/config";

export const config = {
  transport: process.env["IBADAH_MCP_TRANSPORT"] ?? "stdio",
  kemenagBaseUrl:
    process.env["KEMENAG_BASE_URL"] ?? "https://bimasislam.kemenag.go.id/jadwalshalat",
  cacheTtlMinutes: parseInt(process.env["CACHE_TTL_MINUTES"] ?? "720", 10),
  httpTimeoutMs: parseInt(process.env["HTTP_TIMEOUT_MS"] ?? "15000", 10),
  defaultTimezone: process.env["DEFAULT_TIMEZONE"] ?? "Asia/Jakarta",
  enableFallbackProvider: process.env["ENABLE_FALLBACK_PROVIDER"] === "true",
};
