# Salvage Parts System

This project is a web-based application for managing salvage parts, built with Vite and React. It connects to Supabase for storing parts data and assets.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at the local Vite dev server URL (typically `http://localhost:5173`).

## Environment Variables

The application requires Supabase connection details to run. Copy `.env.example` to `.env` and fill in your project information:

```bash
cp .env.example .env
```

In `.env` set the following variables:

- `VITE_SUPABASE_URL` – the URL of your Supabase project
- `VITE_SUPABASE_ANON_KEY` – the anonymous public API key for the project

With these variables configured, the dev server will connect to your Supabase backend.
