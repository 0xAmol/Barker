// Activity Feed types

export type ActivityEventType =
  | 'group_scanned'
  | 'demand_found'
  | 'post_analyzed'
  | 'reply_drafted'
  | 'reply_posted'
  | 'lead_captured'
  | 'sms_sent'
  | 'agent_started'
  | 'agent_paused'
  | 'error';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: Date;
  title: string;
  subtitle?: string;
  details?: Record<string, any>;
  expandable?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  serviceNeeded: string;
  location: string;
  urgency: 'today' | 'this_week' | 'this_month' | 'flexible';
  source: string;
  sourcePostUrl?: string;
  status: 'new' | 'contacted' | 'won' | 'lost' | 'no_answer';
  revenue?: number;
  createdAt: Date;
  notes?: string;
}

export interface AgentStats {
  leadsThisWeek: number;
  leadsThisMonth: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  postsScanned: number;
  repliesPosted: number;
  conversionRate: number;
  topSource: string;
  agentStatus: 'active' | 'paused' | 'error';
  lastRunAt?: Date;
  creditsRemaining: number;
}

// Icon mapping for activity types
export const ACTIVITY_ICONS: Record<ActivityEventType, string> = {
  group_scanned: '🔍',
  demand_found: '📍',
  post_analyzed: '🧠',
  reply_drafted: '✍️',
  reply_posted: '💬',
  lead_captured: '🎯',
  sms_sent: '📱',
  agent_started: '▶️',
  agent_paused: '⏸️',
  error: '⚠️',
};

// Color mapping for activity types
export const ACTIVITY_COLORS: Record<ActivityEventType, string> = {
  group_scanned: '#5B8FB9',
  demand_found: '#d4a843',
  post_analyzed: '#9B59B6',
  reply_drafted: '#3498DB',
  reply_posted: '#2ECC71',
  lead_captured: '#d4a843',
  sms_sent: '#1ABC9C',
  agent_started: '#2ECC71',
  agent_paused: '#F39C12',
  error: '#E74C3C',
};
