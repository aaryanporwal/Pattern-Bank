# Supabase Setup For Self-Hosting

This guide creates a production Supabase backend for PatternBank and deploys the web app to Netlify. It uses the checked-in SQL migration in `supabase/migrations/` as the source of truth.

## Prerequisites

- Node.js and npm
- A Supabase account
- Supabase CLI: `npm install -g supabase`
- Netlify CLI, if deploying to Netlify: `npm install -g netlify-cli`

## 1. Create A Supabase Project

1. Open the [Supabase dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. In **Project Settings > API**, copy:
   - Project URL
   - `anon` public API key

Do not put the `service_role` key in `.env.local`, Netlify client env vars, or any frontend code.

## 2. Configure Local Environment

From the repo root:

```bash
npm install
cp .env.example .env.local
```

Set the copied Supabase values in `.env.local`:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## 3. Apply Database Migrations

Log in and link this repository to your Supabase project:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

Push the migration:

```bash
npx supabase db push
```

The migration creates these public tables with row level security enabled:

- `problems`
- `review_log`
- `user_preferences`
- `feedback`

Authenticated users can only read and manage their own synced data. Feedback can be submitted anonymously or by signed-in users.

Supabase’s migration flow is documented in [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations).

## 4. Configure Auth URLs

In Supabase, open **Authentication > URL Configuration**.

Set **Site URL** to your production app URL, for example:

```text
https://your-site.netlify.app
```

Add redirect URLs for local development and any deployed URLs you use:

```text
http://localhost:5173/**
https://your-site.netlify.app/**
```

If you use Netlify deploy previews, add a preview URL pattern that matches your site. Supabase documents redirect URL behavior and wildcard matching in [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

For Google, GitHub, or Apple sign-in, also enable each provider in **Authentication > Providers** with the OAuth credentials from that provider. If a provider is not enabled, Supabase returns a 400 response like:

```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

For Google sign-in:

1. Create OAuth credentials in Google Cloud Console.
2. Add this Supabase callback URL as an authorized redirect URI:

   ```text
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

3. Paste the Google client ID and client secret into **Authentication > Providers > Google** in Supabase.
4. Save the provider and confirm it is enabled.

## 5. Run Locally

```bash
npm run dev
```

Open the local Vite URL, sign in, and verify cloud sync by adding a problem and refreshing after sign-in.

## 6. Configure Netlify

Link or create the Netlify site:

```bash
netlify login
netlify init
```

Set frontend environment variables:

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
```

If you use optional monitoring or analytics, set those values too:

```bash
netlify env:set VITE_SENTRY_DSN "your-sentry-dsn"
netlify env:set VITE_POSTHOG_KEY "your-posthog-key"
```

Deploy:

```bash
netlify deploy --build
netlify deploy --prod --build
```

## Verification Checklist

- `npm run build` completes locally.
- `npx supabase db push` completes against the linked Supabase project.
- Supabase Table Editor shows `problems`, `review_log`, `user_preferences`, and `feedback`.
- A signed-in user can add, edit, review, and delete problems.
- Review history appears for a signed-in user after completing reviews.
- Settings changes persist after refresh.
- Feedback submission works while signed out and signed in.
