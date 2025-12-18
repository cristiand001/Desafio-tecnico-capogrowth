# Architecture Proposal – Mercado Libre Analyzer

## AI Prompt

I’m starting a technical challenge from scratch.

I need a minimal but correct architecture using Next.js App Router to:

- connect to Mercado Libre using OAuth (server-side only)
- fetch an existing item from Mercado Libre API
- persist item data and description in Supabase (Postgres)
- analyze the publication using OpenAI API and return actionable recommendations

Please propose:

- folder structure
- responsibilities per layer
- which parts should be server-only
  No code yet, just architecture.

## AI Response Summary

The AI proposed a layered architecture using:

- Next.js App Router
- Route Handlers for OAuth callbacks
- Server Actions for orchestration
- `lib/` modules for Mercado Libre, Supabase and OpenAI
- Strict server-only boundaries using `server-only`

## Key Decisions

- OAuth handled via Route Handler (required for external redirects)
- All secrets remain server-side
- Supabase used with repository pattern
- OpenAI analysis isolated in its own module
- Commit-by-prompt workflow will be followed
