// Agent Factory for Barker Managed Agents
// Creates and manages Claude agents for each business

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { BARKER_TOOLS, BARKER_AGENT_SYSTEM_PROMPT } from './tools';
import type { BarkerAgent } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) as any;

// Create a new managed agent for a business
export async function createBarkerAgent(businessId: string): Promise<BarkerAgent> {
  // Get business info
  const { data: business, error: bizError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bizError || !business) {
    throw new Error(`Business not found: ${businessId}`);
  }

  // Create the agent in Anthropic's managed infrastructure
  const agent = await anthropic.beta.agents.create({
    name: `Barker Agent - ${business.business_name}`,
    description: `Autonomous sales agent for ${business.business_name}. Services: ${business.services?.join(', ')}. Area: ${business.service_area?.join(', ')}.`,
    model: 'claude-sonnet-4-6',
    system: buildSystemPrompt(business),
    tools: BARKER_TOOLS,
    config: {
      max_turns: 50, // Allow up to 50 tool calls per session
      timeout_seconds: 600, // 10 minute timeout
    },
  });

  // Create an environment for this agent
  const environment = await anthropic.beta.environments.create({
    name: `barker-env-${businessId}`,
    config: {
      type: 'cloud',
      networking: {
        type: 'unrestricted', // Allow web requests for Facebook scanning
      },
    },
  });

  // Store the agent reference in our database
  const { data: barkerAgent, error: insertError } = await supabase
    .from('barker_agents')
    .insert({
      business_id: businessId,
      anthropic_agent_id: agent.id,
      anthropic_agent_version: agent.version,
      environment_id: environment.id,
      status: 'active',
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to store agent: ${insertError.message}`);
  }

  console.log(
    `[Barker] Created managed agent for ${business.business_name}: ${agent.id}`
  );

  return barkerAgent;
}

// Get or create a Barker agent for a business
export async function getOrCreateAgent(businessId: string): Promise<BarkerAgent> {
  // Check if agent already exists
  const { data: existing } = await supabase
    .from('barker_agents')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active')
    .single();

  if (existing) {
    return existing;
  }

  return createBarkerAgent(businessId);
}

// Update an existing agent (e.g., when business info changes)
export async function updateBarkerAgent(businessId: string): Promise<BarkerAgent> {
  const { data: existing } = await supabase
    .from('barker_agents')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active')
    .single();

  if (!existing) {
    return createBarkerAgent(businessId);
  }

  // Get updated business info
  const { data: business } = await supabase
    .from('agents')
    .select('*')
    .eq('id', businessId)
    .single();

  if (!business) {
    throw new Error(`Business not found: ${businessId}`);
  }

  // Update the agent in Anthropic
  const agent = await anthropic.beta.agents.update(existing.anthropic_agent_id, {
    system: buildSystemPrompt(business),
    description: `Autonomous sales agent for ${business.business_name}. Services: ${business.services?.join(', ')}. Area: ${business.service_area?.join(', ')}.`,
  });

  // Update our reference
  await supabase
    .from('barker_agents')
    .update({
      anthropic_agent_version: agent.version,
    })
    .eq('id', existing.id);

  return { ...existing, anthropic_agent_version: agent.version };
}

// Pause an agent (stops automatic runs)
export async function pauseAgent(businessId: string): Promise<void> {
  await supabase
    .from('barker_agents')
    .update({ status: 'paused' })
    .eq('business_id', businessId);
}

// Resume an agent
export async function resumeAgent(businessId: string): Promise<void> {
  await supabase
    .from('barker_agents')
    .update({ status: 'active' })
    .eq('business_id', businessId);
}

// Delete an agent
export async function deleteBarkerAgent(businessId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('barker_agents')
    .select('*')
    .eq('business_id', businessId)
    .single();

  if (existing) {
    // Delete from Anthropic
    try {
      await anthropic.beta.agents.delete(existing.anthropic_agent_id);
      await anthropic.beta.environments.delete(existing.environment_id);
    } catch (e) {
      console.warn('[Barker] Failed to delete agent from Anthropic:', e);
    }

    // Delete from our database
    await supabase.from('barker_agents').delete().eq('id', existing.id);
  }
}

// List all active agents
export async function listActiveAgents(): Promise<BarkerAgent[]> {
  const { data } = await supabase
    .from('barker_agents')
    .select('*')
    .eq('status', 'active');

  return data || [];
}

// Build system prompt with business-specific context
function buildSystemPrompt(business: any): string {
  const brandVoice = business.brand_voice || {};

  return `${BARKER_AGENT_SYSTEM_PROMPT}

## Your Business Context
- **Business ID**: ${business.id}
- **Business Name**: ${business.business_name}
- **Services**: ${business.services?.join(', ') || 'General services'}
- **Service Area**: ${business.service_area?.join(', ') || 'Local area'}
- **Owner Phone**: ${business.owner_phone}

## Brand Voice for ${business.business_name}
- **Tone**: ${brandVoice.tone || 'Friendly and professional'}
- **Personality**: ${brandVoice.personality || 'Helpful local business'}
- **Key Phrases**: ${brandVoice.key_phrases?.join(', ') || 'Quality service, fair prices'}
- **Avoid**: ${brandVoice.avoid?.join(', ') || 'Being pushy or salesy'}

## What Customers Say
${business.reviews_summary || 'Customers appreciate quality work and responsive service.'}

When you start, call get_agent_context with agent_id="${business.id}" to get the latest information including monitored Facebook groups and recent leads.
`;
}
