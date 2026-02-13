# Padel Progress

## Overview

Padel Progress is a comprehensive performance tracking and AI-powered coaching platform for padel players. It provides technical shot analysis, training session logging, nutrition tracking, wellbeing monitoring, tactical playbooks, strength & conditioning plans, a video library, and an AI coach chat powered by Google Gemini. The app supports multiple user roles (player, coach, admin) and uses Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18+ with TypeScript, bundled by Vite
- **Routing**: wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no global client state manager
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Charts**: Recharts for all data visualizations (bar charts, radar charts, pie charts, line charts)
- **Styling**: Tailwind CSS with CSS custom properties for theming; dark mode (slate-950 base) is the default and only theme
- **Fonts**: Plus Jakarta Sans (body), Outfit (display headings)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via tsx
- **API Pattern**: RESTful JSON endpoints under `/api/` prefix. Route definitions are shared between client and server via `shared/routes.ts`
- **Build**: Custom build script using Vite for client and esbuild for server, outputting to `dist/`
- **Dev Server**: Vite dev server proxied through Express middleware with HMR

### Authentication
- **Replit Auth** via OpenID Connect (passport + openid-client)
- Sessions stored in PostgreSQL using `connect-pg-simple`
- Auth tables (`users`, `sessions`) are defined in `shared/models/auth.ts` and are mandatory — do not drop them
- Login flow: `/api/login` redirects to Replit OIDC, callback handled by passport

### Database
- **PostgreSQL** connected via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Schema location**: `shared/schema.ts` (re-exports models from `shared/models/`)
- **Migrations**: Managed via `drizzle-kit push` (no migration files, direct push to DB)
- **Key tables**: `users`, `sessions` (auth), `user_profiles`, `goals`, `shots`, `shot_history`, `sessions_data`, `nutrition_logs`, `nutrition_goals`, `wellbeing`, `strength_plans`, `tactics`, `videos`, `coach_players`, `coach_feedback`

### Storage Layer
- `server/storage.ts` — Main data access layer implementing `IStorage` interface for all padel-related CRUD operations
- `server/replit_integrations/auth/storage.ts` — Auth-specific user CRUD (mandatory for Replit Auth)
- `server/replit_integrations/chat/storage.ts` — Chat/conversation CRUD

### AI Integration
- **Replit AI Integrations** providing Gemini-compatible API access (no personal API key needed)
- Environment variables: `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL`
- **Chat**: Streaming responses via SSE using `gemini-2.5-flash` model, managed in `server/replit_integrations/chat/`
- **Image Generation**: Uses `gemini-2.5-flash-image` model via `server/replit_integrations/image/`
- **Batch Processing**: Utility in `server/replit_integrations/batch/` for concurrent Gemini requests with rate limiting and retries

### Page Structure

**Player pages:**
- **Dashboard** (`/`) — Overview with goals, quick stats
- **Shots** (`/shots`) — Shot-level skill tracking with charts
- **Library** (`/library`) — Video content library
- **SNC** (`/snc`) — Strength & conditioning plans
- **Progress** (`/progress`) — Charts and analytics for sessions
- **Nutrition** (`/nutrition`) — Food logging and macro tracking
- **Wellbeing** (`/wellbeing`) — Sleep, energy, stress, soreness tracking with radar charts
- **Tactics** (`/tactic`) — Tactical playbook organized by difficulty
- **Feedback** (`/feedback`) — View coach feedback notes
- **Admin** (`/admin`) — Admin panel for managing tactics, videos, and strength plans

**Coach pages:**
- **Coach Dashboard** (`/`) — Lists linked players, add/remove players by email
- **Player Detail** (`/players/:id`) — Tabs: Overview, Shots, Sessions, SNC, Nutrition, Wellbeing, Tactics, Feedback (with form to write feedback)
- **Library** (`/library`) — Video content library
- **Tactics** (`/tactic`) — Tactical playbook
- **Admin** (`/admin`) — Manage tactics, videos, and shared content

### Shared Code (`shared/`)
- `schema.ts` — All Drizzle table definitions and Zod insert schemas
- `routes.ts` — API route definitions with paths, methods, input/output schemas; used by both client hooks and server routes
- `models/auth.ts` — Auth-related tables (users, sessions)

## External Dependencies

### Services
- **PostgreSQL** — Primary database (provisioned via Replit, connection via `DATABASE_URL`)
- **Replit Auth (OIDC)** — Authentication provider (via `ISSUER_URL`, defaults to `https://replit.com/oidc`)

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Express session secret
- `REPL_ID` — Replit environment identifier (auto-set by Replit)
- `AI_INTEGRATIONS_GEMINI_API_KEY` — API key for Gemini via Replit AI Integrations
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Base URL for Gemini API proxy

### Key NPM Packages
- **Server**: express, passport, openid-client, drizzle-orm, pg, connect-pg-simple, @google/genai, zod
- **Client**: react, wouter, @tanstack/react-query, recharts, shadcn/ui (Radix primitives), tailwindcss, date-fns, lucide-react, framer-motion
- **Build**: vite, esbuild, tsx, drizzle-kit