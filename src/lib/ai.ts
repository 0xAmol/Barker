import Anthropic from "@anthropic-ai/sdk";
import type { Agent, BusinessProfile, BrandVoice, DemandSignal } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-20250514";

// ============================================
// BUSINESS INGESTION
// Takes a scraped Google Business profile and
// builds Barker's understanding of the business
// ============================================
export async function buildBrandProfile(profile: BusinessProfile): Promise<{
  brand_voice: BrandVoice;
  reviews_summary: string;
  pricing_tier: "budget" | "mid" | "premium";
  services: string[];
  service_area: string[];
}> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are Barker, an AI sales agent. Analyze this business profile and extract a brand identity.
Return JSON only, no markdown. Schema:
{
  "brand_voice": {
    "tone": "2-3 word description",
    "personality": "one sentence about how this business comes across",
    "key_phrases": ["phrases customers use in reviews"],
    "avoid": ["things to never say based on the brand"],
    "sample_posts": ["3 example social media posts in the brand's voice"]
  },
  "reviews_summary": "What customers love about this business in 2-3 sentences",
  "pricing_tier": "budget|mid|premium based on review language and services",
  "services": ["normalized list of services offered"],
  "service_area": ["cities/neighborhoods served"]
}`,
    messages: [
      {
        role: "user",
        content: `Business: ${profile.name}
Category: ${profile.category || "unknown"}
Rating: ${profile.rating}/5 (${profile.review_count} reviews)
Address: ${profile.address || "unknown"}
Services listed: ${profile.services.join(", ") || "none listed"}

Top reviews:
${profile.reviews
  .slice(0, 10)
  .map((r) => `[${r.rating}★] ${r.text}`)
  .join("\n")}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return JSON.parse(text);
}

// ============================================
// CONTENT GENERATION
// Creates platform-native posts for an agent
// ============================================
export async function generateContent(
  agent: Agent,
  platform: "x" | "facebook" | "instagram",
  contentType: "post" | "reply" | "thread",
  context?: { reply_to_text?: string; trending_topic?: string }
): Promise<{ body: string; hashtags: string[] }> {
  const platformGuidance: Record<string, string> = {
    x: "Max 280 chars. Punchy. No hashtag spam (0-2 max). Can be conversational, funny, or direct. Include a soft CTA.",
    facebook:
      "2-4 sentences. Friendly, neighborhood-focused. Can be longer. Community tone. End with a question or CTA.",
    instagram:
      "Caption style. Use line breaks for readability. 3-5 relevant hashtags. Lifestyle angle when possible.",
  };

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `You are Barker, an AI posting on behalf of "${agent.business_name}".

Brand voice: ${agent.brand_voice.tone || "professional and friendly"}
Personality: ${agent.brand_voice.personality || "helpful local business"}
Services: ${agent.services.join(", ")}
Service area: ${agent.service_area.join(", ")}
What customers love: ${agent.reviews_summary || "quality service"}

Platform: ${platform}
Guidelines: ${platformGuidance[platform]}

${contentType === "reply" && context?.reply_to_text ? `You are replying to this post: "${context.reply_to_text}"` : ""}

Return JSON only: { "body": "the post text", "hashtags": ["relevant", "hashtags"] }

RULES:
- Never sound like a bot or generic AI
- Write like a real person who runs this business
- Reference specific services and area when natural
- Don't oversell — be genuinely helpful
- The referral link will be appended automatically, don't include URLs`,
    messages: [
      {
        role: "user",
        content:
          contentType === "reply"
            ? `Write a helpful reply to this post. Be genuine, not salesy. If it's relevant, mention we can help.`
            : `Write a ${platform} post that would attract potential customers. Mix it up — could be a tip, a before/after story, a seasonal reminder, or a customer success story.`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return JSON.parse(text);
}

// ============================================
// DEMAND SIGNAL ANALYSIS
// Analyzes a social post to determine if someone
// needs the agent's service
// ============================================
export async function analyzeDemandSignal(
  agent: Agent,
  post: { text: string; platform: string; author?: string; url: string }
): Promise<{
  is_relevant: boolean;
  relevance_score: number;
  intent: DemandSignal["intent"];
  location_hint: string | null;
  should_engage: boolean;
  suggested_reply: string | null;
}> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: `You analyze social media posts to find people who need "${agent.business_name}" services.
Services: ${agent.services.join(", ")}
Area: ${agent.service_area.join(", ")}

Return JSON only:
{
  "is_relevant": true/false,
  "relevance_score": 0.0-1.0,
  "intent": "seeking_service|asking_recommendation|complaining|general_discussion",
  "location_hint": "extracted city/neighborhood or null",
  "should_engage": true/false,
  "suggested_reply": "a natural, helpful reply or null if we shouldn't engage"
}

Rules for engagement:
- Only engage if genuinely relevant (score > 0.6)
- Never engage if the post is about a different service area
- Replies should be helpful first, promotional second
- If someone is asking for recommendations, it's okay to mention the business
- If someone is just complaining, only engage if we can genuinely help
- Don't reply to other businesses' posts`,
    messages: [
      {
        role: "user",
        content: `[${post.platform}] @${post.author || "unknown"}: ${post.text}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return JSON.parse(text);
}

// ============================================
// QUOTE PAGE GENERATION
// Creates the landing page copy for an agent
// ============================================
export async function generateQuotePage(agent: Agent): Promise<{
  headline: string;
  subheadline: string;
  services_list: string[];
  review_highlights: { text: string; author: string; rating: number }[];
}> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: `Generate landing page content for a service business quote page. Return JSON only.
{
  "headline": "Short, compelling headline (5-8 words)",
  "subheadline": "One sentence value prop",
  "services_list": ["top 4-6 services to highlight"],
  "review_highlights": [{"text": "short review quote", "author": "first name", "rating": 5}]
}
Make it feel local and trustworthy, not corporate.`,
    messages: [
      {
        role: "user",
        content: `Business: ${agent.business_name}
Services: ${agent.services.join(", ")}
Area: ${agent.service_area.join(", ")}
What customers love: ${agent.reviews_summary}`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  return JSON.parse(text);
}
