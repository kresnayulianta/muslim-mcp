# ibadah-mcp

MCP server for Islamic prayer schedules and daily ibadah logic.

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## Tools
- search-prayer-location
- get-prayer-schedule
- get-prayer-schedule-month
- get-next-prayer
- get-fasting-context
- generate-daily-checklist
- evaluate-reminder-needs

## Architecture
- src/providers/prayer/ — prayer schedule data provider (Kemenag stub)
- src/providers/hijri/ — fasting rules
- src/domain/ — business logic services
- src/tools/ — MCP tool registrations
- src/types/ — shared types

## Rules
- Never write directly to Notion or send Telegram messages
- Always return structured JSON in content
- Wrap all handlers in try/catch with isError: true on failure
- Use .js extensions in all imports
