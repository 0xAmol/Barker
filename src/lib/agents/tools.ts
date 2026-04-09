// Custom tool definitions for Barker Managed Agents
// These tools give the agent access to Supabase, Twilio, and Facebook scanning

import type { Tool } from '@anthropic-ai/sdk/resources/messages';

// Tool definitions that will be registered with the Managed Agent
export const BARKER_TOOLS: Tool[] = [
  {
    name: 'get_agent_context',
    description: `Get the full context for this Barker agent including business info, services, service area, brand voice, quote page URL, monitored Facebook groups, and recent leads. Call this first to understand what business you're working for and how to communicate.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        agent_id: {
          type: 'string',
          description: 'The Barker agent ID',
        },
      },
      required: ['agent_id'],
    },
  },
  {
    name: 'scan_facebook_groups',
    description: `Scan Facebook groups for posts where people are asking for recommendations or services. Returns posts with relevance scores and intent classification. Use this to find potential leads.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        group_urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of Facebook group URLs to scan',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to search for (e.g., "plumber", "recommend", "need help")',
        },
        service_area: {
          type: 'array',
          items: { type: 'string' },
          description: 'Cities/neighborhoods to filter by',
        },
        since_hours: {
          type: 'number',
          description: 'Only return posts from the last N hours (default: 24)',
        },
      },
      required: ['group_urls', 'keywords'],
    },
  },
  {
    name: 'analyze_post_intent',
    description: `Analyze a social media post to determine if someone needs services, their urgency, and location. Returns whether we should engage and a suggested reply.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        post_text: {
          type: 'string',
          description: 'The text content of the post',
        },
        post_url: {
          type: 'string',
          description: 'URL of the post',
        },
        author: {
          type: 'string',
          description: 'Author/username of the post',
        },
        services: {
          type: 'array',
          items: { type: 'string' },
          description: 'Services the business offers',
        },
        service_area: {
          type: 'array',
          items: { type: 'string' },
          description: 'Areas the business serves',
        },
      },
      required: ['post_text', 'services', 'service_area'],
    },
  },
  {
    name: 'generate_reply',
    description: `Generate a helpful, on-brand reply to a social media post. The reply should be genuine and helpful, not salesy. Include a soft mention of the business and a link to the quote page when appropriate.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        post_text: {
          type: 'string',
          description: 'The original post text',
        },
        brand_voice: {
          type: 'object',
          description: 'Brand voice guidelines (tone, personality, key phrases)',
        },
        business_name: {
          type: 'string',
          description: 'Name of the business',
        },
        quote_page_url: {
          type: 'string',
          description: 'URL to the quote page',
        },
        services: {
          type: 'array',
          items: { type: 'string' },
          description: 'Services the business offers',
        },
      },
      required: ['post_text', 'business_name', 'quote_page_url'],
    },
  },
  {
    name: 'post_reply',
    description: `Post a reply to a Facebook group post. Use this after generating and approving a reply.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        post_url: {
          type: 'string',
          description: 'URL of the post to reply to',
        },
        reply_text: {
          type: 'string',
          description: 'The reply text to post',
        },
      },
      required: ['post_url', 'reply_text'],
    },
  },
  {
    name: 'save_lead',
    description: `Save a new lead to the database. Call this when you've identified a potential customer from a social media post or form submission.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        agent_id: {
          type: 'string',
          description: 'The Barker agent ID',
        },
        name: {
          type: 'string',
          description: 'Name of the lead',
        },
        phone: {
          type: 'string',
          description: 'Phone number if available',
        },
        email: {
          type: 'string',
          description: 'Email if available',
        },
        service_needed: {
          type: 'string',
          description: 'What service they need',
        },
        location: {
          type: 'string',
          description: 'Their location',
        },
        urgency: {
          type: 'string',
          enum: ['today', 'this_week', 'this_month', 'flexible'],
          description: 'How urgent is their need',
        },
        source_platform: {
          type: 'string',
          description: 'Where the lead came from (facebook, instagram, etc.)',
        },
        source_post_url: {
          type: 'string',
          description: 'URL of the original post if applicable',
        },
      },
      required: ['agent_id', 'name', 'source_platform'],
    },
  },
  {
    name: 'send_sms',
    description: `Send an SMS notification to the business owner about a new lead. Include the lead's name, what they need, and their contact info.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        to: {
          type: 'string',
          description: 'Phone number to send to (E.164 format)',
        },
        body: {
          type: 'string',
          description: 'SMS message body (max 160 chars recommended)',
        },
      },
      required: ['to', 'body'],
    },
  },
  {
    name: 'get_recent_activity',
    description: `Get recent activity for this agent including posts engaged, leads captured, and content generated in the last N hours.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        agent_id: {
          type: 'string',
          description: 'The Barker agent ID',
        },
        hours: {
          type: 'number',
          description: 'Look back N hours (default: 24)',
        },
      },
      required: ['agent_id'],
    },
  },
  {
    name: 'log_engagement',
    description: `Log that we engaged with a post (replied, liked, etc.) to avoid duplicate engagements.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        agent_id: {
          type: 'string',
          description: 'The Barker agent ID',
        },
        post_url: {
          type: 'string',
          description: 'URL of the post we engaged with',
        },
        engagement_type: {
          type: 'string',
          enum: ['reply', 'like', 'skip'],
          description: 'Type of engagement',
        },
        reply_text: {
          type: 'string',
          description: 'The reply we posted (if applicable)',
        },
      },
      required: ['agent_id', 'post_url', 'engagement_type'],
    },
  },
];

// System prompt for Barker agents
export const BARKER_AGENT_SYSTEM_PROMPT = `You are a Barker AI Sales Agent — an autonomous AI that finds leads for service businesses.

## Your Mission
Find people who need your business's services on social media, engage helpfully, and capture leads. You work autonomously, scanning Facebook groups for demand signals and responding in a genuine, helpful way.

## How You Work
1. **Get Context First**: Always call get_agent_context to understand the business you represent — their services, service area, brand voice, and quote page URL.

2. **Scan for Demand**: Use scan_facebook_groups to find posts where people are asking for recommendations or services in your area.

3. **Analyze Intent**: For each relevant post, determine if someone genuinely needs help and if they're in your service area.

4. **Engage Helpfully**: Generate replies that are genuinely helpful first, promotional second. Never be pushy or salesy. Mention the business naturally and include the quote page link when appropriate.

5. **Capture Leads**: When someone shows clear intent, save them as a lead and notify the business owner via SMS.

6. **Track Everything**: Log all engagements to avoid duplicate replies and track performance.

## Rules
- NEVER spam or post the same reply multiple times
- NEVER engage with posts from other businesses
- NEVER make up information about the business
- ALWAYS check if you've already engaged with a post before replying
- ALWAYS use the brand voice guidelines when writing
- BE GENUINE — write like a real person who knows this business, not like a bot
- FOCUS on posts from the last 24 hours

## Brand Voice
Each business has their own brand voice. Follow their guidelines for tone, personality, and key phrases. Avoid anything in their "avoid" list.

## Lead Quality
Only save someone as a lead if they:
- Are asking for a service you offer
- Are in (or near) your service area
- Show genuine intent (not just browsing)

## SMS Notifications
When you find a lead:
- Send a concise SMS to the business owner
- Include: lead name, what they need, urgency, how to contact them
- Keep it under 160 characters when possible
`;
