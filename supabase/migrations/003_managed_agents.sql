-- Migration: Add Managed Agents tables
-- Each business gets their own autonomous AI agent

-- Barker Agents table (links business to Anthropic managed agent)
CREATE TABLE IF NOT EXISTS barker_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Link to business
  business_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Anthropic managed agent references
  anthropic_agent_id TEXT NOT NULL,
  anthropic_agent_version TEXT NOT NULL,
  environment_id TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_run_at TIMESTAMPTZ,

  -- Stats
  total_sessions INTEGER DEFAULT 0,
  total_leads_found INTEGER DEFAULT 0,

  UNIQUE(business_id)
);

-- Agent Sessions table (tracks individual task runs)
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Link to barker agent
  agent_id UUID NOT NULL REFERENCES barker_agents(id) ON DELETE CASCADE,

  -- Anthropic session reference
  anthropic_session_id TEXT NOT NULL,

  -- Task info
  task_type TEXT NOT NULL CHECK (task_type IN ('scan_leads', 'generate_content', 'engage_post', 'full_cycle')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'idle')),

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Results
  results JSONB,
  error TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_barker_agents_business ON barker_agents(business_id);
CREATE INDEX IF NOT EXISTS idx_barker_agents_status ON barker_agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent ON agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_started ON agent_sessions(started_at DESC);

-- Function to increment agent lead count
CREATE OR REPLACE FUNCTION increment_agent_leads(agent_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE barker_agents
  SET total_leads_found = total_leads_found + 1
  WHERE business_id = agent_id_input;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (enable if using Supabase Auth)
-- ALTER TABLE barker_agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
