// Session Manager for Barker Managed Agents
// Handles running agent tasks and processing events

import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { handleToolCall } from './tool-handlers';
import type { BarkerAgent, AgentSession, AgentSessionResults } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Task types and their prompts
const TASK_PROMPTS = {
  scan_leads: `Scan for new leads in monitored Facebook groups.

1. First, call get_agent_context to get the business info and monitored groups.
2. Then, call scan_facebook_groups with the group URLs, relevant keywords based on services, and service area.
3. For each relevant post found, call analyze_post_intent to determine if we should engage.
4. For posts we should engage with, call generate_reply to create a helpful response.
5. Post the reply using post_reply.
6. If someone is clearly looking for our service, save them as a lead and send an SMS to the owner.
7. Log all engagements to avoid duplicates.

Focus on posts from the last 4 hours. Be selective — only engage with posts that are clearly relevant.`,

  generate_content: `Generate engaging social media content for the business.

1. Call get_agent_context to understand the business, services, and brand voice.
2. Create 2-3 social media posts that would attract potential customers.
3. Posts should be helpful tips, seasonal reminders, or customer success stories.
4. Follow the brand voice guidelines strictly.
5. Do NOT post them yet — just return the content for review.`,

  engage_post: `Engage with a specific post that was flagged as relevant.

1. Call get_agent_context to get the business info.
2. The post URL will be provided. Generate a helpful, on-brand reply.
3. Post the reply.
4. If the person seems like a hot lead, save them and notify the owner.`,

  full_cycle: `Run a complete lead generation cycle.

1. Get context for this business.
2. Check recent activity to avoid duplicates.
3. Scan all monitored Facebook groups for demand signals.
4. Engage with relevant posts (max 5 per run to avoid looking like spam).
5. Save any new leads and notify the owner via SMS.
6. Report a summary of what you did.

Be conservative — quality over quantity. Only engage when you can add genuine value.`,
};

// Start a new session for an agent
export async function startSession(
  agent: BarkerAgent,
  taskType: keyof typeof TASK_PROMPTS,
  additionalContext?: string
): Promise<AgentSession> {
  // Create session in Anthropic
  const session = await anthropic.beta.sessions.create({
    agent: agent.anthropic_agent_id,
    environment_id: agent.environment_id,
    title: `${taskType} - ${new Date().toISOString()}`,
  });

  // Store session in our database
  const { data: agentSession, error } = await supabase
    .from('agent_sessions')
    .insert({
      agent_id: agent.id,
      anthropic_session_id: session.id,
      task_type: taskType,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  console.log(`[Barker] Started session ${session.id} for task: ${taskType}`);

  return agentSession;
}

// Run a session and handle events
export async function runSession(
  agent: BarkerAgent,
  session: AgentSession,
  taskType: keyof typeof TASK_PROMPTS,
  additionalContext?: string
): Promise<AgentSessionResults> {
  const results: AgentSessionResults = {
    posts_scanned: 0,
    leads_found: 0,
    replies_posted: 0,
    content_generated: 0,
    sms_sent: 0,
  };

  const taskPrompt = TASK_PROMPTS[taskType];
  const fullPrompt = additionalContext
    ? `${taskPrompt}\n\nAdditional Context:\n${additionalContext}`
    : taskPrompt;

  try {
    // Stream events from the session
    const stream = anthropic.beta.sessions.events.stream(
      session.anthropic_session_id
    );

    // Send the initial user message
    await anthropic.beta.sessions.events.send(session.anthropic_session_id, {
      events: [
        {
          type: 'user.message',
          content: [{ type: 'text', text: fullPrompt }],
        },
      ],
    });

    // Process events as they arrive
    for await (const event of stream) {
      switch (event.type) {
        case 'agent.message':
          // Agent is thinking/responding
          for (const block of event.content || []) {
            if (block.type === 'text') {
              console.log(`[Barker Agent] ${block.text}`);
            }
          }
          break;

        case 'agent.tool_use':
          // Agent is calling a tool
          console.log(`[Barker] Tool call: ${event.name}`);

          try {
            // Execute the tool
            const toolResult = await handleToolCall(event.name, event.input as Record<string, unknown>);

            // Track metrics
            if (event.name === 'scan_facebook_groups') {
              results.posts_scanned += (toolResult as any).posts?.length || 0;
            } else if (event.name === 'save_lead') {
              if ((toolResult as any).success) results.leads_found++;
            } else if (event.name === 'post_reply') {
              if ((toolResult as any).success) results.replies_posted++;
            } else if (event.name === 'send_sms') {
              if ((toolResult as any).success) results.sms_sent++;
            }

            // Send tool result back to agent
            await anthropic.beta.sessions.events.send(
              session.anthropic_session_id,
              {
                events: [
                  {
                    type: 'tool.result',
                    tool_use_id: event.id,
                    content: JSON.stringify(toolResult),
                  },
                ],
              }
            );
          } catch (toolError: any) {
            console.error(`[Barker] Tool error:`, toolError);

            // Send error back to agent
            await anthropic.beta.sessions.events.send(
              session.anthropic_session_id,
              {
                events: [
                  {
                    type: 'tool.result',
                    tool_use_id: event.id,
                    content: JSON.stringify({ error: toolError.message }),
                    is_error: true,
                  },
                ],
              }
            );
          }
          break;

        case 'session.status_idle':
          // Agent has finished
          console.log('[Barker] Session completed');
          break;

        case 'session.status_error':
          // Session errored
          console.error('[Barker] Session error:', event);
          throw new Error('Session failed');

        default:
          // Other events (streaming, etc.)
          break;
      }
    }

    // Update session status
    await supabase
      .from('agent_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results,
      })
      .eq('id', session.id);

    // Update agent stats
    await supabase
      .from('barker_agents')
      .update({
        last_run_at: new Date().toISOString(),
        total_sessions: supabase.rpc('increment', { x: 1 }),
        total_leads_found: supabase.rpc('increment', { x: results.leads_found }),
      })
      .eq('id', agent.id);

    return results;
  } catch (error: any) {
    // Update session as failed
    await supabase
      .from('agent_sessions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: error.message,
      })
      .eq('id', session.id);

    throw error;
  }
}

// Run a full task (start session + run)
export async function runTask(
  businessId: string,
  taskType: keyof typeof TASK_PROMPTS,
  additionalContext?: string
): Promise<AgentSessionResults> {
  // Get the agent
  const { data: agent } = await supabase
    .from('barker_agents')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active')
    .single();

  if (!agent) {
    throw new Error(`No active agent for business: ${businessId}`);
  }

  // Start session
  const session = await startSession(agent, taskType, additionalContext);

  // Run it
  return runSession(agent, session, taskType, additionalContext);
}

// Run all active agents (for cron job)
export async function runAllActiveAgents(): Promise<{
  ran: number;
  failed: number;
  results: Record<string, AgentSessionResults>;
}> {
  const { data: agents } = await supabase
    .from('barker_agents')
    .select('*, agents!inner(status)')
    .eq('status', 'active')
    .eq('agents.status', 'active');

  const results: Record<string, AgentSessionResults> = {};
  let ran = 0;
  let failed = 0;

  for (const agent of agents || []) {
    try {
      console.log(`[Barker] Running agent: ${agent.business_id}`);
      const session = await startSession(agent, 'full_cycle');
      results[agent.business_id] = await runSession(agent, session, 'full_cycle');
      ran++;
    } catch (error) {
      console.error(`[Barker] Failed to run agent ${agent.business_id}:`, error);
      failed++;
    }
  }

  return { ran, failed, results };
}
