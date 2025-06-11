# Salvage Parts System

A Vite + React application for browsing and managing salvageable parts with a Supabase backend.

## Prerequisites

- Node.js 18 or newer
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) if you want to run a local database

## Environment variables

Copy `.env.example` to `.env` and fill in the required keys:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values can come from a hosted Supabase project or from a local Supabase instance started with the CLI.

## Installation

```bash
git clone <repository-url>
cd salvage-parts-system
npm install
```

### Supabase setup for local development

1. Install the Supabase CLI and start the local stack:

   ```bash
   supabase start
   ```

2. Apply the migrations in `supabase/migrations`:

   ```bash
   supabase db reset
   ```

This will create the database schema and insert sample data for development.

## Development

Run the dev server with Vite:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

## Building for production

Create an optimized build in the `dist` directory:

```bash
npm run build
```

You can preview the build locally using:

```bash
npm run preview
```

## Linting and testing

The project currently provides ESLint for basic checks:

```bash
npm run lint
```

There are no automated tests yet.

