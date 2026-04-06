-- Barker Database Schema
-- Supabase (Postgres)
-- Run: supabase db push

-- ============================================
-- AGENTS
-- One row per Barker instance (one per business)
-- ============================================
create table agents (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Owner info (Dave)
  owner_name    text not null,
  owner_phone   text not null,
  owner_email   text,

  -- Business profile (ingested from Google Business)
  business_name text not null,
  business_url  text,                          -- Google Business URL
  services      jsonb default '[]'::jsonb,     -- ["plumbing", "water heater repair", ...]
  service_area  jsonb default '[]'::jsonb,     -- ["Katy, TX", "Houston, TX", ...]
  reviews_summary text,                        -- AI-generated summary of what customers love
  brand_voice   jsonb default '{}'::jsonb,     -- tone, style, key phrases
  pricing_tier  text,                          -- "budget", "mid", "premium" (inferred)

  -- Configuration
  status        text default 'active' check (status in ('active', 'paused', 'setup')),
  mode          text default 'autopilot' check (mode in ('autopilot', 'approval', 'manual')),
  post_frequency jsonb default '{"x": 3, "facebook": 2, "instagram": 1}'::jsonb,

  -- Wallet (Phase 2)
  wallet_address text,                         -- Solana wallet address (Crossmint)
  wallet_balance numeric(12,2) default 0,      -- Cached USDC balance
  credit_balance numeric(12,2) default 0,      -- Prepaid lead credits (USD)

  -- Stats (cached, updated by daily cron)
  total_leads       int default 0,
  total_revenue     numeric(12,2) default 0,
  total_spent       numeric(12,2) default 0,
  leads_this_week   int default 0,
  revenue_this_week numeric(12,2) default 0
);

create index idx_agents_status on agents(status);
create index idx_agents_owner_phone on agents(owner_phone);

-- ============================================
-- LEADS
-- Every person Barker captures for a business
-- ============================================
create table leads (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id) on delete cascade,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Lead info
  name          text not null,
  phone         text,
  email         text,
  service_needed text,
  location      text,
  urgency       text check (urgency in ('today', 'this_week', 'this_month', 'flexible')),
  notes         text,

  -- Attribution
  source_platform text check (source_platform in ('x', 'facebook', 'instagram', 'nextdoor', 'reddit', 'google', 'direct', 'referral')),
  source_post_url text,                        -- URL of the post/comment that generated this lead
  content_id      uuid,                        -- FK to content_queue if applicable
  campaign_id     text,                        -- For paid campaigns
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,

  -- Status tracking
  status        text default 'new' check (status in ('new', 'contacted', 'won', 'lost', 'no_answer')),
  revenue       numeric(12,2),                 -- Set by owner when marking "won"
  owner_notified_at timestamptz,               -- When we texted the owner
  owner_responded_at timestamptz,              -- When owner replied with status

  -- Billing
  lead_cost     numeric(8,2),                  -- What we charged for this lead
  billed        boolean default false
);

create index idx_leads_agent on leads(agent_id);
create index idx_leads_status on leads(status);
create index idx_leads_created on leads(created_at desc);

-- ============================================
-- CONTENT_QUEUE
-- Everything Barker creates or plans to post
-- ============================================
create table content_queue (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id) on delete cascade,
  created_at    timestamptz default now(),

  -- Content
  platform      text not null check (platform in ('x', 'facebook', 'instagram', 'tiktok', 'nextdoor')),
  content_type  text not null check (content_type in ('post', 'reply', 'thread', 'reel', 'story', 'carousel', 'ad')),
  body          text not null,                 -- The actual text content
  media_urls    jsonb default '[]'::jsonb,     -- Image/video URLs if any
  hashtags      jsonb default '[]'::jsonb,
  referral_url  text,                          -- Tracked link to quote page

  -- Targeting (for replies/engagement)
  reply_to_url  text,                          -- URL of post being replied to
  reply_to_text text,                          -- Text of post being replied to

  -- Scheduling
  status        text default 'draft' check (status in ('draft', 'queued', 'posted', 'failed', 'rejected')),
  scheduled_for timestamptz,
  posted_at     timestamptz,
  platform_post_id text,                       -- ID on the platform after posting

  -- Performance (updated by metrics cron)
  impressions   int default 0,
  clicks        int default 0,
  engagements   int default 0,
  conversions   int default 0,

  -- Cost (if boosted/promoted)
  is_paid       boolean default false,
  ad_spend      numeric(8,2) default 0
);

create index idx_content_agent on content_queue(agent_id);
create index idx_content_status on content_queue(status);
create index idx_content_scheduled on content_queue(scheduled_for);

-- ============================================
-- TRANSACTIONS
-- Every money movement through the system
-- ============================================
create table transactions (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id) on delete cascade,
  created_at    timestamptz default now(),

  -- Transaction details
  type          text not null check (type in (
    'credit_purchase',     -- Dave buys lead credits
    'lead_charge',         -- Platform charges for a delivered lead
    'ad_spend',            -- Barker spends on paid promotion
    'wallet_fund',         -- Credits converted to USDC in agent wallet
    'wallet_withdraw',     -- Dave withdraws from agent wallet
    'referral_earned',     -- Bounty from agent-to-agent referral
    'referral_paid',       -- Bounty paid for referring a lead
    'platform_fee'         -- Platform's cut of transactions
  )),

  amount        numeric(12,2) not null,        -- Always positive
  direction     text not null check (direction in ('inflow', 'outflow')),
  currency      text default 'USD' check (currency in ('USD', 'USDC')),

  -- Blockchain (Phase 2)
  solana_tx_sig text,                          -- Solana transaction signature
  wallet_from   text,                          -- Sender wallet address
  wallet_to     text,                          -- Receiver wallet address

  -- Reference
  lead_id       uuid references leads(id),
  content_id    uuid references content_queue(id),
  description   text,

  -- Stripe (Phase 1)
  stripe_payment_id text,
  stripe_charge_id  text
);

create index idx_tx_agent on transactions(agent_id);
create index idx_tx_type on transactions(type);
create index idx_tx_created on transactions(created_at desc);

-- ============================================
-- QUOTE_PAGES
-- Auto-generated landing pages per agent
-- ============================================
create table quote_pages (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id) on delete cascade,
  created_at    timestamptz default now(),

  slug          text unique not null,          -- barker.app/q/daves-plumbing
  headline      text,
  subheadline   text,
  services_list jsonb default '[]'::jsonb,
  review_highlights jsonb default '[]'::jsonb, -- Top 3-5 review quotes
  cta_text      text default 'Get a Free Quote',
  phone_display text,                          -- Business phone to display
  active        boolean default true
);

create index idx_quote_agent on quote_pages(agent_id);
create index idx_quote_slug on quote_pages(slug);

-- ============================================
-- DEMAND_SIGNALS
-- Posts/comments Barker found where someone needs the service
-- ============================================
create table demand_signals (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id) on delete cascade,
  found_at      timestamptz default now(),

  platform      text not null,
  post_url      text not null,
  post_text     text not null,
  author_handle text,
  location_hint text,                          -- Extracted location from post text

  -- AI analysis
  relevance_score numeric(3,2),                -- 0.00-1.00 how relevant to this agent
  intent          text check (intent in ('seeking_service', 'asking_recommendation', 'complaining', 'general_discussion')),

  -- Action taken
  status        text default 'new' check (status in ('new', 'engaged', 'skipped', 'converted')),
  response_content_id uuid references content_queue(id)
);

create index idx_signals_agent on demand_signals(agent_id);
create index idx_signals_status on demand_signals(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agents_updated_at before update on agents
  for each row execute function update_updated_at();

create trigger leads_updated_at before update on leads
  for each row execute function update_updated_at();
