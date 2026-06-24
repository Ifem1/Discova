# Discova Tasks

## Completed
- [x] Project initialization (Next.js + TypeScript + Tailwind v4)
- [x] Install dependencies (Supabase, ethers, zustand, lucide-react, framer-motion, next-themes)
- [x] Custom color palette with light/dark mode (user palette: #E0B4B2, #E99856, #A54055, #622347, #42164B, #1A1836)
- [x] Typography setup (Sora headings, General Sans body via Fontshare)
- [x] Type definitions (Laboratory, Paper, Project, HypothesisRequest, Decision, etc.)
- [x] Supabase client + sync layer
- [x] GenLayer wrapper functions (all required contract methods)
- [x] UI component library (Button, Card, Input, Textarea, Select, Badge, ScoreBar)
- [x] Layout components (Navbar, Sidebar, AppShell, ThemeProvider)
- [x] Landing page (hero, features, how-it-works, consensus explainer, CTA)
- [x] Dashboard page (stats, recent decisions, pending reviews)
- [x] Laboratories pages (list, create, detail with papers/projects/members)
- [x] Papers pages (list, register, detail)
- [x] Projects pages (list, create, detail with hypotheses)
- [x] Hypothesis generation form (submit to GenLayer consensus)
- [x] Case file page (verdict, scores, evidence, citations, rationale, on-chain record)
- [x] Human review page (review queue + review form)
- [x] Audit trail page (transaction log with explorer links)
- [x] Settings page (profile, subscription, wallet, notifications)
- [x] Auth pages (login, signup, callback)
- [x] Supabase database migration (all 14 tables + RLS + triggers)
- [x] GenLayer DiscovaContract (all required methods)

## Remaining
- [ ] Connect to real Supabase project (replace env vars)
- [ ] Deploy DiscovaContract to StudioNet
- [ ] Wire up real wallet connection (MetaMask/WalletConnect)
- [ ] Replace mock data with live Supabase + GenLayer queries
- [ ] PDF upload to Supabase Storage
- [ ] Stripe integration for Pro subscriptions
- [ ] E2E tests
- [ ] Production deployment (Vercel)
