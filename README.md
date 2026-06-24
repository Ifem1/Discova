# Discova

Evidence-backed hypothesis generation through AI consensus, powered by [GenLayer](https://genlayer.com) Intelligent Contracts.

Discova helps researchers generate testable, scientifically defensible hypotheses from uploaded literature collections. Researchers submit a research question along with existing evidence, and GenLayer validators independently assess whether the proposed hypothesis is grounded in cited evidence, demonstrates credible novelty, forms logical connections across literature, and produces a scientifically defensible research direction.

Every verdict is scored across multiple dimensions, cited, and permanently recorded on-chain.

## How It Works

1. **Create a Laboratory** — Register a research lab on GenLayer StudioNet. The creator automatically becomes the lab owner with full permissions.

2. **Register Papers** — Add research papers with title, authors, DOI, year, and an abstract/summary. Papers are stored on-chain and referenced during hypothesis generation.

3. **Create a Research Project** — Organise hypothesis requests under a project with a specific research domain and objective.

4. **Generate a Hypothesis** — Submit a research question with existing evidence, domain context, constraints, and desired outcome. GenLayer's AI validators independently evaluate the question and produce a consensus verdict with detailed scoring.

5. **Review & Activate** — Hypotheses flagged as `NEEDS_REVIEW` enter the human review queue. Reviewers can approve, request revision, or reject. Approved hypotheses can be activated on-chain.

## Consensus Scoring

Each hypothesis is evaluated across six dimensions (0–100):

| Dimension | What It Measures |
|-----------|-----------------|
| **Evidence Support** | How well the hypothesis is grounded in cited literature |
| **Novelty** | Whether the hypothesis offers a new research direction |
| **Citation Quality** | Quality and relevance of referenced papers |
| **Plausibility** | Scientific plausibility of the proposed mechanism |
| **Explainability** | Clarity of the hypothesis and its rationale |
| **Testability** | Whether the hypothesis can be empirically tested |

Verdicts: `APPROVED`, `NEEDS_REVISION`, `UNSUPPORTED`, or `NEEDS_REVIEW`.

## Architecture

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Blockchain**: GenLayer StudioNet (Chain ID 61999) — Intelligent Contract written in Python
- **Database**: Supabase (PostgreSQL) — caching/indexing layer for fast UI queries
- **Wallet**: In-browser keypair generation via `viem/accounts` — no MetaMask required
- **Auth**: Supabase Auth (email/password)

### Data Flow

```
User submits hypothesis request
        |
        v
GenLayer Intelligent Contract (on-chain)
  - Validates permissions (lab membership)
  - Stores request, runs AI consensus
  - Records verdict, scores, audit trail
        |
        v
Frontend reads back contract-assigned IDs
        |
        v
Supabase (off-chain cache)
  - Syncs for fast list/search queries
  - Stores user profiles, sessions
```

**GenLayer is the source of truth for all scientific data.** Supabase is a read cache and auth provider only.

### On-Chain vs Off-Chain

| On-Chain (GenLayer) | Off-Chain (Supabase) |
|--------------------|--------------------|
| Laboratory registry & roles | User profiles & auth |
| Paper metadata & summaries | Cached lists for UI |
| Research project records | Session management |
| Hypothesis requests & verdicts | Usage analytics |
| Consensus scores & findings | Notification preferences |
| Human review decisions | Full PDF storage |
| Audit trail | Search indexes |

## Smart Contract

The Intelligent Contract (`contracts/DiscovaContract.py`) handles:

- **Laboratory management** — create, set status, manage roles (OWNER, ADMIN, RESEARCHER, REVIEWER)
- **Paper registry** — register papers with metadata, update summaries, set status
- **Research projects** — create projects under labs, track objectives and domains
- **Hypothesis generation** — submit requests, run AI consensus with `prompt_non_comparative`, store structured verdicts
- **Human review** — approve/reject/revise hypotheses flagged for expert review
- **Hypothesis activation** — mark approved hypotheses as activated on-chain
- **Audit trail** — immutable log of every action with timestamps and actor addresses
- **Configurable thresholds** — per-lab approval score minimums, auto-escalation rules

The contract uses **non-comparative equivalence** (`gl.eq_principle.prompt_non_comparative`) for hypothesis generation, meaning each validator independently produces a hypothesis and it's accepted as long as it meets basic scientific quality criteria. This prevents UNDETERMINED outcomes that would occur with strict comparative matching.

### Contract Address

**StudioNet**: `0x7D6388595Ca1526145d21bC66e0E8f721DFB30e6`

## Project Structure

```
discova/
├── contracts/
│   └── DiscovaContract.py      # GenLayer Intelligent Contract
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/           # Dashboard with live stats
│   │   ├── laboratory/          # Lab list + create
│   │   ├── papers/              # Paper list + register
│   │   ├── projects/            # Project list + create
│   │   ├── hypothesis/          # Generate + result detail
│   │   ├── review/              # Human review queue
│   │   ├── audit/               # On-chain audit trail
│   │   ├── settings/            # Wallet management + account
│   │   └── auth/                # Login + signup
│   ├── components/
│   │   ├── layout/              # Sidebar, Navbar, ThemeProvider
│   │   └── ui/                  # Button, Card, Input, Badge, etc.
│   ├── hooks/
│   │   └── useWallet.ts         # In-browser wallet (generate/import/remove)
│   └── lib/
│       ├── genlayer.ts          # GenLayer contract read/write helpers
│       ├── supabase.ts          # Supabase client
│       └── supabase-sync.ts     # Sync functions + fetch helpers
├── .env.local                   # Environment variables (not committed)
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A GenLayer StudioNet wallet (generated in-app)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_DISCOVA_CONTRACT_ADDRESS=your-contract-address
```

### Supabase Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
CREATE TABLE IF NOT EXISTS laboratories (
  id text PRIMARY KEY,
  name text,
  research_area text,
  metadata_hash text,
  owner text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS papers (
  id text PRIMARY KEY,
  laboratory_id text,
  title text,
  authors text,
  doi text,
  publication_year int,
  metadata_hash text,
  status text DEFAULT 'active',
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_projects (
  id text PRIMARY KEY,
  laboratory_id text,
  title text,
  objective text,
  domain text,
  metadata_hash text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hypothesis_requests (
  id text PRIMARY KEY,
  laboratory_id text,
  project_id text,
  research_question text,
  existing_evidence text,
  constraints text,
  desired_outcome text,
  paper_ids text[],
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hypothesis_decisions (
  id text PRIMARY KEY,
  request_id text,
  verdict text,
  hypothesis text,
  scores jsonb,
  findings jsonb,
  tx_hash text,
  explorer_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS human_reviews (
  id text PRIMARY KEY,
  request_id text,
  reviewer_address text,
  decision text,
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY,
  request_id text,
  action text,
  actor text,
  details text,
  tx_hash text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_transactions (
  id text PRIMARY KEY,
  tx_hash text,
  explorer_url text,
  created_at timestamptz DEFAULT now()
);

-- Disable RLS for development
ALTER TABLE laboratories DISABLE ROW LEVEL SECURITY;
ALTER TABLE papers DISABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE hypothesis_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE hypothesis_decisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE human_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE contract_transactions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON laboratories TO anon, authenticated;
GRANT ALL ON papers TO anon, authenticated;
GRANT ALL ON research_projects TO anon, authenticated;
GRANT ALL ON hypothesis_requests TO anon, authenticated;
GRANT ALL ON hypothesis_decisions TO anon, authenticated;
GRANT ALL ON human_reviews TO anon, authenticated;
GRANT ALL ON audit_events TO anon, authenticated;
GRANT ALL ON contract_transactions TO anon, authenticated;
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Wallet Setup

Discova uses in-browser wallet generation — no MetaMask required.

1. Sign up with email
2. Go to **Settings**
3. Click **Generate Wallet** — this creates a keypair stored in your browser's localStorage
4. **Back up your private key** — if you lose it, you lose access to your on-chain data
5. To use the same wallet on another device, use **Import Wallet** with your backed-up private key

## Deploying the Smart Contract

1. Go to [GenLayer Studio](https://studio.genlayer.com)
2. Open the contract editor
3. Paste the contents of `contracts/DiscovaContract.py`
4. Deploy to StudioNet
5. Copy the new contract address and update `NEXT_PUBLIC_DISCOVA_CONTRACT_ADDRESS` in `.env.local`

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js](https://nextjs.org) | React framework (App Router) |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Framer Motion](https://motion.dev) | Animations |
| [GenLayer](https://genlayer.com) | Intelligent Contract blockchain |
| [genlayer-js](https://www.npmjs.com/package/genlayer-js) | GenLayer JavaScript SDK |
| [Supabase](https://supabase.com) | Auth + PostgreSQL database |
| [viem](https://viem.sh) | Wallet keypair generation |
| [Lucide React](https://lucide.dev) | Icons |

## License

MIT
