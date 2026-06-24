-- Discova Supabase Schema
-- Supabase is a mirror/cache layer. GenLayer is the source of truth for all scientific decisions.

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  wallet_address text,
  subscription text not null default 'free' check (subscription in ('free', 'pro')),
  generations_used integer not null default 0,
  generations_limit integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- Laboratories (mirror of GenLayer)
create table if not exists laboratories (
  id text primary key,
  name text not null,
  research_area text not null,
  metadata_hash text,
  owner text not null,
  status text not null default 'active',
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Laboratory Roles (mirror)
create table if not exists laboratory_roles (
  id uuid primary key default gen_random_uuid(),
  laboratory_id text not null references laboratories(id) on delete cascade,
  user_address text not null,
  role text not null check (role in ('owner', 'admin', 'researcher', 'reviewer')),
  created_at timestamptz not null default now(),
  unique(laboratory_id, user_address)
);

-- Research Projects (mirror)
create table if not exists research_projects (
  id text primary key,
  laboratory_id text not null references laboratories(id) on delete cascade,
  title text not null,
  objective text,
  domain text,
  metadata_hash text,
  status text not null default 'active',
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Papers (mirror + PDF storage)
create table if not exists papers (
  id text primary key,
  laboratory_id text not null references laboratories(id) on delete cascade,
  title text not null,
  authors text,
  doi text,
  publication_year integer,
  metadata_hash text,
  pdf_url text,
  status text not null default 'active',
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Literature Collections
create table if not exists literature_collections (
  id uuid primary key default gen_random_uuid(),
  laboratory_id text not null references laboratories(id) on delete cascade,
  name text not null,
  description text,
  paper_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Hypothesis Requests (mirror)
create table if not exists hypothesis_requests (
  id text primary key,
  laboratory_id text not null,
  project_id text not null,
  research_question text not null,
  existing_evidence text,
  constraints text,
  desired_outcome text,
  paper_ids text[] not null default '{}',
  status text not null default 'pending',
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Hypothesis Decisions (mirror)
create table if not exists hypothesis_decisions (
  id text primary key,
  request_id text not null references hypothesis_requests(id) on delete cascade,
  verdict text not null,
  hypothesis text,
  scores jsonb,
  findings jsonb,
  tx_hash text,
  explorer_url text,
  created_at timestamptz not null default now()
);

-- Human Reviews (mirror)
create table if not exists human_reviews (
  id text primary key,
  request_id text not null references hypothesis_requests(id) on delete cascade,
  reviewer_address text not null,
  decision text not null check (decision in ('approve', 'reject', 'revise')),
  comments text,
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Activated Hypotheses (mirror)
create table if not exists activated_hypotheses (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references hypothesis_requests(id) on delete cascade,
  activated_by text not null,
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Audit Events (mirror)
create table if not exists audit_events (
  id text primary key,
  request_id text,
  action text not null,
  actor text not null,
  details text,
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Contract Transactions (indexing)
create table if not exists contract_transactions (
  id text primary key,
  method text not null,
  tx_hash text not null,
  status text not null default 'pending',
  explorer_url text,
  created_at timestamptz not null default now()
);

-- Evidence Files
create table if not exists evidence_files (
  id uuid primary key default gen_random_uuid(),
  request_id text references hypothesis_requests(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_labs_owner on laboratories(owner);
create index if not exists idx_papers_lab on papers(laboratory_id);
create index if not exists idx_projects_lab on research_projects(laboratory_id);
create index if not exists idx_requests_lab on hypothesis_requests(laboratory_id);
create index if not exists idx_requests_project on hypothesis_requests(project_id);
create index if not exists idx_decisions_request on hypothesis_decisions(request_id);
create index if not exists idx_reviews_request on human_reviews(request_id);
create index if not exists idx_audit_request on audit_events(request_id);
create index if not exists idx_transactions_hash on contract_transactions(tx_hash);

-- RLS Policies
alter table profiles enable row level security;
alter table subscriptions enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can read own subscriptions" on subscriptions for select using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
