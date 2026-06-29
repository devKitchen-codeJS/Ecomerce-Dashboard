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

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor to create the `events` table and enable realtime.
