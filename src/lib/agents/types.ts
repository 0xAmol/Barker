// Managed Agent types for Barker

export interface BarkerAgent {
  id: string;
  anthropic_agent_id: string;
  anthropic_agent_version: string;
  environment_id: string;
  business_id: string;
  status: 'active' | 'paused' | 'error';
  created_at: string;
  last_run_at?: string;
  total_sessions: number;
  total_leads_found: number;
}

export interface AgentSession {
  id: string;
  agent_id: string;
  anthropic_session_id: string;
  task_type: 'scan_leads' | 'generate_content' | 'engage_post' | 'full_cycle';
  status: 'running' | 'completed' | 'failed' | 'idle';
  started_at: string;
  completed_at?: string;
  results?: AgentSessionResults;
  error?: string;
}

export interface AgentSessionResults {
  posts_scanned: number;
  leads_found: number;
  replies_posted: number;
  content_generated: number;
  sms_sent: number;
}

// Tool input/output types
export interface ScanFacebookGroupsInput {
  group_urls: string[];
  keywords: string[];
  service_area: string[];
  since_hours: number;
}

export interface ScanFacebookGroupsOutput {
  posts: {
    url: string;
    text: string;
    author: string;
    location_hint?: string;
    relevance_score: number;
    intent: string;
  }[];
}

export interface SendSmsInput {
  to: string;
  body: string;
}

export interface SendSmsOutput {
  success: boolean;
  message_sid?: string;
  error?: string;
}

export interface SaveLeadInput {
  agent_id: string;
  name: string;
  phone?: string;
  email?: string;
  service_needed?: string;
  location?: string;
  urgency?: string;
  source_platform: string;
  source_post_url?: string;
}

export interface SaveLeadOutput {
  success: boolean;
  lead_id?: string;
  error?: string;
}

export interface GetAgentContextInput {
  agent_id: string;
}

export interface GetAgentContextOutput {
  business_name: string;
  services: string[];
  service_area: string[];
  brand_voice: {
    tone?: string;
    personality?: string;
    key_phrases?: string[];
    avoid?: string[];
  };
  reviews_summary?: string;
  quote_page_url: string;
  owner_phone: string;
  monitored_groups: {
    group_id: string;
    group_name: string;
    group_url: string;
  }[];
  recent_leads: {
    id: string;
    name: string;
    service_needed?: string;
    created_at: string;
  }[];
}

export interface PostReplyInput {
  post_url: string;
  reply_text: string;
}

export interface PostReplyOutput {
  success: boolean;
  reply_url?: string;
  error?: string;
}
