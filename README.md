# PatternBank

[![Netlify Status](https://api.netlify.com/api/v1/badges/b5657775-7a03-4627-8c6b-b0b9a8988dc7/deploy-status)](https://app.netlify.com/projects/patternbank/deploys)
![React](https://img.shields.io/badge/React-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4)

Spaced repetition for LeetCode interview prep.

PatternBank helps you log solved problems, organize them by algorithmic pattern, rate your confidence, and review them when they are due.

This is Aaryan Porwal's maintained fork of PatternBank. The web app is deployed with Netlify.

## Features

- Spaced repetition review scheduling based on confidence ratings
- Pattern-based organization for algorithmic problem solving
- Curated problem lists, including NeetCode, Grind, and LeetCode Hot 100
- Local-first storage with optional Supabase sync
- OAuth sign-in with Google, GitHub, and Apple
- Progress dashboard, review history, and confidence trends

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- Vitest and Playwright
- Netlify

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these values in `.env.local`:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

For a complete backend setup, see [Supabase Setup For Self-Hosting](docs/supabase-setup.md).

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite dev server            |
| `npm run build`    | Type-check and build for production  |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Run ESLint                           |
| `npm run test`     | Run unit tests                       |
| `npm run test:e2e` | Run Playwright tests                 |

## Deployment

This fork is intended to deploy on Netlify.

| Setting           | Value                                         |
| ----------------- | --------------------------------------------- |
| Build command     | `npm run build`                               |
| Publish directory | `dist`                                        |
| SPA fallback      | Rewrite `/*` to `/index.html`                 |
| Required env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Optional env vars | `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`         |

## Attribution

PatternBank was originally created by [Derek Zhang](https://github.com/DerekZ-113). This fork is maintained by [Aaryan Porwal](https://github.com/aaryanporwal).

Licensed under the [GNU General Public License v3.0](LICENSE).
