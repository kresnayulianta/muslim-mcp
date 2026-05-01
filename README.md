# @kresnayulianta/muslim-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for Islamic tools — prayer schedules, Quran reader, Hijri calendar, tadarus tracker, and Islamic quotes. Built for Indonesia (Kemenag RI method via Aladhan API).

## Features

| Tool | Description |
|------|-------------|
| `search-prayer-location` | Search province/city for prayer schedule queries |
| `get-prayer-schedule` | Daily prayer schedule for a city and date |
| `get-prayer-schedule-month` | Monthly prayer schedule |
| `get-next-prayer` | Next upcoming prayer and countdown |
| `get-optional-prayer-times` | Dhuha, Tahajjud, and Witir times |
| `get-fasting-context` | Fasting context (Ramadan, Senin/Kamis, etc.) |
| `generate-daily-checklist` | Daily ibadah checklist |
| `evaluate-reminder-needs` | Evaluate whether a prayer reminder should trigger |
| `get-islamic-quote` | Daily or topic-based Islamic quote (Quran/Hadith) |
| `list-islamic-quote-topics` | List available quote topics |
| `get-hijri-date` | Get Hijri date for today or convert from Gregorian |
| `hijri-to-gregorian` | Convert Hijri date to Gregorian |
| `get-hijri-calendar` | Full month calendar with both date formats |
| `get-islamic-events` | All Islamic holidays for a Hijri year |
| `list-surahs` | List all 114 Quranic surahs |
| `get-surah` | Get a surah with Arabic text and Indonesian translation |
| `get-ayah` | Get a specific ayah |
| `get-juz` | Get all ayahs in a juz |
| `search-quran` | Search the Quran by keyword |
| `get-daily-ayah` | Get today's ayah (deterministic by date) |
| `log-tadarus` | Log Quran reading progress |
| `get-tadarus-progress` | View tadarus progress and estimated khatam date |
| `set-tadarus-target` | Set khatam target date |
| `reset-tadarus` | Reset tadarus tracker |

## Usage

### npx — stdio mode (Claude Desktop, Cursor, etc.)

```bash
npx -y @kresnayulianta/muslim-mcp
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "muslim": {
      "command": "npx",
      "args": ["-y", "@kresnayulianta/muslim-mcp"]
    }
  }
}
```

### HTTP server mode

```bash
npx -y @kresnayulianta/muslim-mcp --http --port 3002
```

### HTTP Authentication

Set `MCP_API_KEY` environment variable to lock the server:

```
Authorization: Bearer your-api-key
```

## How to Use

Once connected to Claude Desktop or any MCP-compatible client, you can ask Claude questions about prayer times, the Quran, Hijri calendar, and daily ibadah.

### Prayer Times

```
"Jadwal sholat hari ini di Jakarta"
"Kapan sholat Ashar di Bandung besok?"
"Tampilkan jadwal sholat bulan ini untuk Surabaya"
"Sholat apa yang selanjutnya dan berapa menit lagi?"
"Jam berapa Dhuha dan Tahajjud malam ini?"
```

### Fasting & Daily Checklist

```
"Apakah hari ini ada puasa sunnah?"
"Buatkan checklist ibadah harian saya untuk hari ini"
"Apakah perlu kirimkan reminder sholat sekarang?"
```

### Quran

```
"Tampilkan Surah Al-Fatihah beserta terjemahannya"
"Cari ayat Quran tentang sabar"
"Ayat berapa hari ini? (daily ayah)"
"Tampilkan semua surah di Juz 30"
"Bacakan ayat Al-Baqarah 255 (Ayat Kursi)"
```

### Hijri Calendar & Islamic Events

```
"Tanggal Hijriyah hari ini berapa?"
"Konversi 17 Agustus 2025 ke Hijriyah"
"Tampilkan kalender Hijriyah bulan ini"
"Apa saja hari besar Islam tahun 1446 H?"
```

### Tadarus Tracker

```
"Catat tadarus saya hari ini: Surah Al-Baqarah sampai ayat 50"
"Berapa progress tadarus saya dan kapan khatam?"
"Set target khatam Al-Quran sebelum akhir Ramadan"
```

### Islamic Quotes

```
"Berikan quote Islam tentang ikhlas"
"Quote Al-Quran untuk memulai hari"
"Tampilkan hadith tentang sholat"
```

## Environment Variables

```bash
MCP_API_KEY=your-secret       # Optional: lock server with API key
MCP_HTTP_PORT=3002            # HTTP server port (default: 3002)
DEFAULT_TIMEZONE=Asia/Jakarta # Timezone (default: Asia/Jakarta)
```

## Data Sources

All data comes from free public APIs — no API keys required:

- **Prayer times**: [Aladhan API](https://aladhan.com/prayer-times-api) (method 20 = Kemenag RI)
- **Quran**: [Al-Quran Cloud API](https://alquran.cloud/api)
- **Islamic quotes**: Built-in dataset (15 Quran verses + 25 hadith)

## Tadarus Persistence

When running via Docker, mount a volume for tadarus data to persist across restarts:

```bash
docker run -p 3002:3002 \
  -v muslim-mcp-data:/app/data \
  ghcr.io/kresnayulianta/muslim-mcp
```

## License

MIT
