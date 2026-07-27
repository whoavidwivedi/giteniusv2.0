# Giteniusv2.0

Gitenius is an AI-powered GitHub profile analyzer and AI developer portfolio generator.
This version (`v2.0`) has been fully migrated into a modern Turborepo built on top of [ZeroStarter](https://zerostarter.dev).

## Architecture

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui, Recharts.
- **Backend:** Hono API deployed via Cloudflare Workers / Node.js, utilizing `@google/genai` for profile analysis.
- **Tooling:** Bun, Turborepo, Biome, Lefthook, Portless.

## Features

- **AI Profile Analysis:** Generates an AI-driven executive summary and developer archetype for a GitHub user.
- **Activity Visualization:** Showcases language distribution, commit activity, and repo statistics with rich interactive charts.
- **Export to PDF:** Download the generated AI resume / developer portfolio as a clean PDF.
- **Smart Tech Stack Matching:** The AI identifies the developer's core tech stack and soft skills.

## Development

```bash
bun install
bun run dev
```

This serves named `.localhost` dev URLs via portless (`bunx portless list` shows them); `PORTLESS=0 bun run dev` uses fixed ports instead (web `:3000`, api `:4000`).

To test the AI functionality, you must define your `GEMINI_API_KEY` in your `.env`.
