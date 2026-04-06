-- Add channel settings table for platform connections
-- Each agent can have settings per platform (Facebook groups, Google, etc.)

create table agent_channel_settings (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id) on delete cascade,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  platform      text not null check (platform in ('facebook', 'google', 'nextdoor', 'instagram', 'x')),
  enabled       boolean default true,

  -- Platform-specific settings stored as JSON
  -- Facebook: { "monitored_groups": [{ "group_id": "...", "group_name": "...", "group_url": "..." }] }
  -- Google: { "place_id": "...", "respond_to_reviews": true }
  -- Nextdoor: { "neighborhood_ids": ["..."] }
  settings      jsonb default '{}'::jsonb,

  -- Auth (if agent-specific tokens needed)
  access_token  text,
  token_expires_at timestamptz,

  unique(agent_id, platform)
);

create index idx_channel_agent on agent_channel_settings(agent_id);
create index idx_channel_platform on agent_channel_settings(platform, enabled);

create trigger channel_settings_updated_at before update on agent_channel_settings
  for each row execute function update_updated_at();

-- Helper function to increment agent revenue (called from SMS webhook)
create or replace function increment_agent_revenue(p_agent_id uuid, p_revenue numeric)
returns void as $$
begin
  update agents
  set total_revenue = total_revenue + p_revenue,
      revenue_this_week = revenue_this_week + p_revenue
  where id = p_agent_id;
end;
$$ language plpgsql;
