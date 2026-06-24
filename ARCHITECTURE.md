# Discova Architecture

## Stack
- **Frontend**: Next.js 15 (App Router) + React + TypeScript + Tailwind CSS v4
- **Backend/Storage**: Supabase (auth, profiles, file storage, caching, indexing)
- **Smart Contract**: GenLayer Intelligent Contract (DiscovaContract)
- **Network**: GenLayer StudioNet (Chain ID: 61999)

## Data Flow
1. User uploads literature → stored in Supabase Storage
2. User registers paper on-chain → GenLayer `register_paper` → mirror to Supabase
3. User submits hypothesis request → GenLayer `submit_and_generate_hypothesis`
4. GenLayer validators reach consensus → verdict + scores stored on-chain
5. Frontend reads decision from GenLayer → mirrors to Supabase for fast queries
6. Human review (optional) → on-chain `human_review_hypothesis`
7. Activation → on-chain `mark_hypothesis_activated`

## Source of Truth
- **GenLayer**: All scientific decisions, verdicts, scores, audit trail
- **Supabase**: Auth, profiles, subscriptions, PDF storage, search/filter, analytics, caching

## Key Directories
```
src/
  app/           # Next.js pages (App Router)
  components/    # React components (ui, layout, domain-specific)
  hooks/         # Custom hooks + Zustand store
  lib/           # Supabase client, GenLayer wrapper, utils
  types/         # TypeScript type definitions
contracts/       # GenLayer Intelligent Contract (Python)
supabase/        # Database migrations
```
