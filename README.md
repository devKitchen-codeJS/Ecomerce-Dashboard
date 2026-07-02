# AI Realtime E-commerce Analytics Dashboard

Next.js + TypeScript + Supabase + TailwindCSS MVP for a realtime e-commerce analytics dashboard.

## Current Step

- Initialized project structure manually.
- Added `/dashboard` with simulated realtime events.
- Added reusable UI and dashboard components.
- Added Supabase environment and SQL schema starter.

## Run Locally

Install dependencies first:

```bash
npm install
```

Then start the app:

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

## Auth

Supabase Auth is used for:

- email/password registration and login
- email confirmation through Supabase Auth email templates
- password recovery through Supabase Auth email templates
- Google OAuth

In Supabase Dashboard:

1. Enable the Email provider.
2. Enable email confirmation.
3. Enable the Google provider and add Google OAuth credentials.
4. Add these redirect URLs:

```bash
http://localhost:3000/auth
http://localhost:3000/auth/reset-password
http://localhost:3000/dashboard
```

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor to create the `events` table and enable realtime.
