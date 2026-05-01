// Tool handlers for Barker Managed Agents
// These functions execute when the agent calls a tool

import { supabase } from '@/lib/supabase';
import { sendSms } from '@/lib/notify';
import { scanFacebookGroups } from '@/lib/scanner';
import type {
  GetAgentContextInput,
  GetAgentContextOutput,
  ScanFacebookGroupsInput,
  ScanFacebookGroupsOutput,
  SendSmsInput,
  SendSmsOutput,
  SaveLeadInput,
  SaveLeadOutput,
  PostReplyInput,
  PostReplyOutput,
} from './types';

// Tool handler registry
export async function handleToolCall(
  toolName: string,
  toolInput: any
): Promise<unknown> {
  switch (toolName) {
    case 'get_agent_context':
      return handleGetAgentContext(toolInput as GetAgentContextInput);
    case 'scan_facebook_groups':
      return handleScanFacebookGroups(toolInput as ScanFacebookGroupsInput);
    case 'analyze_post_intent':
      return handleAnalyzePostIntent(toolInput as any);
    case 'generate_reply':
      return handleGenerateReply(toolInput as any);
    case 'post_reply':
      return handlePostReply(toolInput as PostReplyInput);
    case 'save_lead':
      return handleSaveLead(toolInput as SaveLeadInput);
    case 'send_sms':
      return handleSendSms(toolInput as SendSmsInput);
    case 'get_recent_activity':
      return handleGetRecentActivity(toolInput as any);
    case 'log_engagement':
      return handleLogEngagement(toolInput as any);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Get full context for the agent's business
async function handleGetAgentContext(
  input: GetAgentContextInput
): Promise<GetAgentContextOutput> {
  const { agent_id } = input;

  // Get agent and business info
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agent_id)
    .single();

  if (agentError || !agent) {
    throw new Error(`Agent not found: ${agent_id}`);
  }

  // Get monitored groups
  const { data: channelSettings } = await supabase
    .from('agent_channel_settings')
    .select('settings')
    .eq('agent_id', agent_id)
    .eq('platform', 'facebook')
    .single();

  // Get quote page
  const { data: quotePage } = await supabase
    .from('quote_pages')
    .select('slug')
    .eq('agent_id', agent_id)
    .eq('active', true)
    .single();

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, name, service_needed, created_at')
    .eq('agent_id', agent_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    business_name: agent.business_name,
    services: agent.services || [],
    service_area: agent.service_area || [],
    brand_voice: agent.brand_voice || {},
    reviews_summary: agent.reviews_summary,
    quote_page_url: quotePage
      ? `${process.env.NEXT_PUBLIC_APP_URL}/q/${quotePage.slug}`
      : '',
    owner_phone: agent.owner_phone,
    monitored_groups: channelSettings?.settings?.monitored_groups || [],
    recent_leads: recentLeads || [],
  };
}

// Scan Facebook groups for demand signals
async function handleScanFacebookGroups(
  input: ScanFacebookGroupsInput
): Promise<any> {
  const { group_urls, keywords, service_area, since_hours = 24 } = input;

  const posts = await scanFacebookGroups({
    groupUrls: group_urls,
    keywords,
    serviceArea: service_area,
    sinceHours: since_hours,
  });

  return { posts };
}

// Analyze a post to determine intent
async function handleAnalyzePostIntent(input: {
  post_text: string;
  post_url?: string;
  author?: string;
  services: string[];
  service_area: string[];
}): Promise<{
  is_relevant: boolean;
  relevance_score: number;
  intent: string;
  location_hint: string | null;
  should_engage: boolean;
  reason: string;
}> {
  const { post_text, services, service_area } = input;

  // Check for service keywords
  const serviceKeywords = services.flatMap((s) =>
    s.toLowerCase().split(/\s+/)
  );
  const postLower = post_text.toLowerCase();

  const hasServiceMatch = serviceKeywords.some((kw) => postLower.includes(kw));
  const hasRecommendationAsk =
    postLower.includes('recommend') ||
    postLower.includes('anyone know') ||
    postLower.includes('looking for') ||
    postLower.includes('need a') ||
    postLower.includes('need help');

  // Check for location match
  const locationMatch = service_area.find((loc) =>
    postLower.includes(loc.toLowerCase())
  );

  const relevance_score =
    (hasServiceMatch ? 0.4 : 0) +
    (hasRecommendationAsk ? 0.4 : 0) +
    (locationMatch ? 0.2 : 0);

  const is_relevant = relevance_score >= 0.6;
  const should_engage = is_relevant && hasRecommendationAsk;

  let intent = 'general_discussion';
  if (hasRecommendationAsk && hasServiceMatch) {
    intent = 'seeking_service';
  } else if (hasRecommendationAsk) {
    intent = 'asking_recommendation';
  } else if (postLower.includes('terrible') || postLower.includes('awful')) {
    intent = 'complaining';
  }

  return {
    is_relevant,
    relevance_score,
    intent,
    location_hint: locationMatch || null,
    should_engage,
    reason: should_engage
      ? `Post asks for ${services[0]} recommendation in ${locationMatch || 'our area'}`
      : `Not relevant: ${!hasServiceMatch ? 'no service match' : !hasRecommendationAsk ? 'not asking for recommendations' : 'low relevance'}`,
  };
}

// Generate a reply based on brand voice
async function handleGenerateReply(input: {
  post_text: string;
  brand_voice?: { tone?: string; personality?: string; key_phrases?: string[] };
  business_name: string;
  quote_page_url: string;
  services?: string[];
}): Promise<{ reply: string }> {
  const { post_text, brand_voice, business_name, quote_page_url, services } = input;

  // Build a natural reply based on brand voice
  const tone = brand_voice?.tone || 'friendly and professional';
  const keyPhrases = brand_voice?.key_phrases || [];

  // Template-based generation (in production, use Claude for this)
  const replies = [
    `Hey! ${business_name} might be able to help — they've done great work for folks in this area. ${keyPhrases[0] || 'Fast service and fair pricing.'} Here's their quote page: ${quote_page_url}`,
    `I'd recommend ${business_name} for this! ${keyPhrases[0] || "They're reliable and do quality work."} You can get a quick quote here: ${quote_page_url}`,
    `${business_name} is solid for ${services?.[0] || 'this kind of work'}. ${keyPhrases[0] || 'Really responsive and professional.'} Quote page: ${quote_page_url}`,
  ];

  return { reply: replies[Math.floor(Math.random() * replies.length)] };
}

// Post a reply to Facebook (stubbed - would use Facebook API or browser automation)
async function handlePostReply(input: PostReplyInput): Promise<PostReplyOutput> {
  const { post_url, reply_text } = input;

  // In production, this would use Facebook Graph API or browser automation
  // For now, we'll log and return success
  console.log(`[Barker] Would post reply to ${post_url}:`, reply_text);

  // Store the pending reply for manual posting or automation
  await supabase.from('content_queue').insert({
    platform: 'facebook',
    content_type: 'reply',
    body: reply_text,
    reply_to_url: post_url,
    status: 'queued',
  });

  return {
    success: true,
    reply_url: undefined, // Would be populated after actual posting
  };
}

// Save a lead to the database
async function handleSaveLead(input: SaveLeadInput): Promise<SaveLeadOutput> {
  const {
    agent_id,
    name,
    phone,
    email,
    service_needed,
    location,
    urgency,
    source_platform,
    source_post_url,
  } = input;

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      agent_id,
      name,
      phone,
      email,
      service_needed,
      location,
      urgency,
      source_platform,
      source_post_url,
      status: 'new',
      billed: false,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Update agent lead count
  await supabase.rpc('increment_agent_leads', { agent_id_input: agent_id });

  return { success: true, lead_id: lead.id };
}

// Send SMS notification
async function handleSendSms(input: SendSmsInput): Promise<SendSmsOutput> {
  const { to, body } = input;

  try {
    const result = await sendSms(to, body);
    return { success: true, message_sid: result.sid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get recent activity for the agent
async function handleGetRecentActivity(input: {
  agent_id: string;
  hours?: number;
}): Promise<{
  posts_engaged: number;
  leads_captured: number;
  replies_posted: number;
}> {
  const { agent_id, hours = 24 } = input;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  // Count recent engagements
  const { count: engagements } = await supabase
    .from('demand_signals')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent_id)
    .eq('status', 'engaged')
    .gte('found_at', since);

  // Count recent leads
  const { count: leads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent_id)
    .gte('created_at', since);

  // Count recent replies
  const { count: replies } = await supabase
    .from('content_queue')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent_id)
    .eq('content_type', 'reply')
    .gte('created_at', since);

  return {
    posts_engaged: engagements || 0,
    leads_captured: leads || 0,
    replies_posted: replies || 0,
  };
}

// Log an engagement to avoid duplicates
async function handleLogEngagement(input: {
  agent_id: string;
  post_url: string;
  engagement_type: 'reply' | 'like' | 'skip';
  reply_text?: string;
}): Promise<{ success: boolean }> {
  const { agent_id, post_url, engagement_type, reply_text } = input;

  await supabase.from('demand_signals').upsert(
    {
      agent_id,
      post_url,
      status: engagement_type === 'skip' ? 'skipped' : 'engaged',
      found_at: new Date().toISOString(),
      platform: 'facebook',
      post_text: '', // Already have the URL
      relevance_score: engagement_type === 'skip' ? 0 : 0.8,
      intent: 'seeking_service',
    },
    { onConflict: 'post_url' }
  );

  return { success: true };
}
