# Architecture Proposal – Mercado Libre Analyzer

## Context

This document describes the proposed architecture for the technical challenge.
The goal is to build a minimal but correct solution, focusing on clear separation
of concerns, security, and server-side boundaries.

## Requirements

The application must:

- Connect to Mercado Libre using OAuth (server-side only)
- Fetch an existing item from Mercado Libre API
- Persist item data and description in Supabase (Postgres)
- Analyze the publication using OpenAI API and return actionable recommendations

No code yet, just architecture.

## Proposed Architecture

The solution is based on **Next.js App Router** and a layered architecture:

- **Route Handlers**

  - Handle Mercado Libre OAuth callback and token exchange
  - Required for external redirects

- **Server Actions**

  - Orchestrate business flows (fetch item → persist → analyze)
  - Act as the application service layer

- **Lib Layer (`/lib`)**
  - `mercadolibre.ts`: API client and OAuth helpers
  - `supabase.ts`: database access and repositories
  - `openai.ts`: publication analysis logic
  - All modules marked as `server-only`

## Server-only Boundaries

- OAuth secrets and API keys never reach the client
- Mercado Libre, Supabase Service Role and OpenAI calls are server-only
- Client components only trigger server actions and render results

## Key Decisions

- OAuth handled via Route Handlers
- Secrets stored only in environment variables
- Supabase accessed using a repository pattern
- OpenAI logic isolated in its own module
- Commit-by-prompt workflow followed for traceability
