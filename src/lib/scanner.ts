// Facebook Groups demand scanner
// Monitors local recommendation groups for posts matching an agent's services
// Uses Facebook Graph API to search public group posts

import type { Agent, DemandSignal } from "@/types";
import { supabase } from "./supabase";
import { analyzeDemandSignal } from "./ai";

const FB_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN!;
const FB_API = "https://graph.facebook.com/v19.0";

// ============================================
// CORE: Scan groups for demand signals
// Called by cron every 15-30 minutes per agent
// ============================================
export async function scanForDemand(agent: Agent): Promise<DemandSignal[]> {
  const groups = await getAgentGroups(agent.id);
  const signals: DemandSignal[] = [];

  for (const group of groups) {
    const posts = await searchGroupPosts(group.group_id, agent.services);

    for (const post of posts) {
      // Skip if we've already seen this post
      const { data: existing } = await supabase
        .from("demand_signals")
        .select("id")
        .eq("post_url", post.permalink)
        .single();

      if (existing) continue;

      // AI analyzes if this post is actually someone who needs the service
      const analysis = await analyzeDemandSignal(agent, {
        text: post.message,
        platform: "facebook",
        author: post.from?.name,
        url: post.permalink,
      });

      if (!analysis.is_relevant || analysis.relevance_score < 0.5) continue;

      // Store the signal
      const { data: signal } = await supabase
        .from("demand_signals")
        .insert({
          agent_id: agent.id,
          platform: "facebook",
          post_url: post.permalink,
          post_text: post.message,
          author_handle: post.from?.name,
          location_hint: analysis.location_hint,
          relevance_score: analysis.relevance_score,
          intent: analysis.intent,
          status: "new",
        })
        .select()
        .single();

      if (signal) {
        signals.push(signal as DemandSignal);

        // If Barker should engage and agent is in autopilot mode, queue a reply
        if (analysis.should_engage && analysis.suggested_reply && agent.mode === "autopilot") {
          await queueGroupReply(agent, signal as DemandSignal, post, analysis.suggested_reply);
        }
      }
    }
  }

  return signals;
}

// ============================================
// Search a Facebook group for posts matching keywords
// ============================================
async function searchGroupPosts(
  groupId: string,
  services: string[]
): Promise<FacebookPost[]> {
  // Build search keywords from services
  // "plumbing" → ["plumber", "plumbing", "leak", "pipe", "drain"]
  const keywords = buildSearchKeywords(services);

  try {
    // Get recent posts from the group (last 24 hours)
    const res = await fetch(
      `${FB_API}/${groupId}/feed?` +
        new URLSearchParams({
          access_token: FB_ACCESS_TOKEN,
          fields: "id,message,from,created_time,permalink_url,type",
          limit: "50",
          since: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000).toString(),
        }),
      { next: { revalidate: 900 } } // Cache for 15 min
    );

    if (!res.ok) {
      console.error(`FB API error for group ${groupId}:`, res.status);
      return [];
    }

    const data = await res.json();
    const posts: FacebookPost[] = (data.data || [])
      .filter((p: any) => p.message) // Only posts with text
      .map((p: any) => ({
        id: p.id,
        message: p.message,
        from: p.from,
        created_time: p.created_time,
        permalink: p.permalink_url || `https://facebook.com/${p.id}`,
        type: p.type,
      }));

    // Filter to posts that contain any of our keywords
    return posts.filter((post) => {
      const text = post.message.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    });
  } catch (error) {
    console.error(`Failed to scan group ${groupId}:`, error);
    return [];
  }
}

// ============================================
// Post a reply in a Facebook group
// ============================================
async function queueGroupReply(
  agent: Agent,
  signal: DemandSignal,
  post: FacebookPost,
  replyText: string
) {
  // Append the quote page link
  const quotePageUrl = await getQuotePageUrl(agent.id);
  const fullReply = quotePageUrl
    ? `${replyText}\n\nGet a free quote: ${quotePageUrl}`
    : replyText;

  // Queue the reply in content_queue
  const { data: content } = await supabase
    .from("content_queue")
    .insert({
      agent_id: agent.id,
      platform: "facebook",
      content_type: "reply",
      body: fullReply,
      reply_to_url: signal.post_url,
      reply_to_text: signal.post_text,
      referral_url: quotePageUrl,
      status: agent.mode === "autopilot" ? "queued" : "draft",
      scheduled_for: new Date().toISOString(), // Post immediately
    })
    .select()
    .single();

  // Link the signal to the content
  if (content) {
    await supabase
      .from("demand_signals")
      .update({
        status: "engaged",
        response_content_id: content.id,
      })
      .eq("id", signal.id);
  }

  // If autopilot, actually post the reply now
  if (agent.mode === "autopilot" && content) {
    await postFacebookReply(post.id, fullReply, content.id);
  }
}

// ============================================
// Actually post a comment on Facebook
// ============================================
async function postFacebookReply(
  postId: string,
  message: string,
  contentId: string
) {
  try {
    const res = await fetch(`${FB_API}/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: FB_ACCESS_TOKEN,
        message,
      }),
    });

    if (!res.ok) {
      console.error("Failed to post FB reply:", res.status);
      await supabase
        .from("content_queue")
        .update({ status: "failed" })
        .eq("id", contentId);
      return;
    }

    const data = await res.json();
    await supabase
      .from("content_queue")
      .update({
        status: "posted",
        posted_at: new Date().toISOString(),
        platform_post_id: data.id,
      })
      .eq("id", contentId);
  } catch (error) {
    console.error("FB reply error:", error);
  }
}

// ============================================
// Group management
// ============================================

interface AgentGroup {
  group_id: string;
  group_name: string;
  group_url: string;
}

// Get the Facebook groups an agent is monitoring
async function getAgentGroups(agentId: string): Promise<AgentGroup[]> {
  const { data } = await supabase
    .from("agent_channel_settings")
    .select("settings")
    .eq("agent_id", agentId)
    .eq("platform", "facebook")
    .single();

  return data?.settings?.monitored_groups || [];
}

// Discover local Facebook groups for an agent's service area
// Used during onboarding to suggest groups to monitor
export async function discoverLocalGroups(
  serviceArea: string[],
  services: string[]
): Promise<{ id: string; name: string; member_count: number; url: string }[]> {
  const queries = [];

  for (const area of serviceArea.slice(0, 3)) {
    // Search for recommendation/homeowner groups in the area
    queries.push(`${area} homeowners`);
    queries.push(`${area} recommendations`);
    queries.push(`${area} community`);

    // Service-specific groups
    for (const service of services.slice(0, 2)) {
      queries.push(`${area} ${service}`);
    }
  }

  const groups: Map<string, any> = new Map();

  for (const query of queries.slice(0, 5)) {
    try {
      const res = await fetch(
        `${FB_API}/search?` +
          new URLSearchParams({
            access_token: FB_ACCESS_TOKEN,
            q: query,
            type: "group",
            fields: "id,name,member_count,privacy",
            limit: "10",
          })
      );

      if (!res.ok) continue;
      const data = await res.json();

      for (const group of data.data || []) {
        // Only public groups
        if (group.privacy === "OPEN" && !groups.has(group.id)) {
          groups.set(group.id, {
            id: group.id,
            name: group.name,
            member_count: group.member_count || 0,
            url: `https://facebook.com/groups/${group.id}`,
          });
        }
      }
    } catch {
      continue;
    }
  }

  // Sort by member count, biggest first
  return Array.from(groups.values()).sort(
    (a, b) => b.member_count - a.member_count
  );
}

// ============================================
// Tool-handler wrapper: scan specific groups by URL
// ============================================
export async function scanFacebookGroups({
  groupUrls,
  keywords,
  serviceArea,
  sinceHours = 24,
}: {
  groupUrls: string[];
  keywords: string[];
  serviceArea?: string | string[];
  sinceHours?: number;
}): Promise<{ id: string; text: string; author: string; url: string; posted_at: string }[]> {
  const results: { id: string; text: string; author: string; url: string; posted_at: string }[] = [];

  for (const groupUrl of groupUrls) {
    const groupId = groupUrl.replace(/.*groups\//, "").replace(/\/.*/, "");
    try {
      const res = await fetch(
        `${FB_API}/${groupId}/feed?` +
          new URLSearchParams({
            access_token: FB_ACCESS_TOKEN,
            fields: "id,message,from,created_time,permalink_url",
            limit: "50",
            since: Math.floor((Date.now() - sinceHours * 60 * 60 * 1000) / 1000).toString(),
          }),
        { next: { revalidate: 900 } }
      );
      if (!res.ok) continue;
      const data = await res.json();

      for (const post of data.data || []) {
        if (!post.message) continue;
        const lower = post.message.toLowerCase();
        if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
          results.push({
            id: post.id,
            text: post.message,
            author: post.from?.name || "Unknown",
            url: post.permalink_url || `https://facebook.com/${post.id}`,
            posted_at: post.created_time,
          });
        }
      }
    } catch {
      continue;
    }
  }

  return results;
}

// ============================================
// Keyword expansion
// Turns service names into search keywords
// ============================================
function buildSearchKeywords(services: string[]): string[] {
  const keywordMap: Record<string, string[]> = {
    plumbing: ["plumber", "plumbing", "leak", "pipe", "drain", "clogged", "faucet", "water heater", "sewer", "toilet", "garbage disposal"],
    hvac: ["hvac", "ac repair", "air conditioning", "heating", "furnace", "a/c", "thermostat", "duct", "coolant", "ac unit"],
    electrical: ["electrician", "electrical", "wiring", "outlet", "breaker", "circuit", "panel", "light fixture"],
    roofing: ["roofer", "roofing", "roof repair", "roof leak", "shingle", "gutter", "roof replacement"],
    cleaning: ["cleaning service", "house cleaner", "maid service", "deep clean", "move out clean", "cleaning lady"],
    landscaping: ["landscaper", "landscaping", "lawn care", "lawn mowing", "tree trimming", "yard work", "sprinkler"],
    painting: ["painter", "painting", "house painting", "interior paint", "exterior paint", "paint job"],
    pest_control: ["pest control", "exterminator", "termite", "bug spray", "rodent", "ant problem", "roach"],
    locksmith: ["locksmith", "locked out", "lock change", "rekey", "deadbolt"],
    photography: ["photographer", "photography", "photo shoot", "family photos", "headshots"],
    mobile_detailing: ["detailing", "car detail", "auto detail", "mobile wash", "car wash"],
    personal_training: ["personal trainer", "fitness trainer", "workout", "gym trainer"],
    real_estate: ["realtor", "real estate agent", "selling house", "buying house", "listing agent"],
  };

  // Generic recommendation keywords that signal someone is asking for help
  const intentKeywords = [
    "anyone know",
    "can anyone recommend",
    "looking for a",
    "need a",
    "who do you use for",
    "suggestions for",
    "recommendation for",
    "does anyone have a good",
    "help me find",
    "know a good",
    "who should i call",
    "any recommendations",
  ];

  const keywords: Set<string> = new Set();

  for (const service of services) {
    const normalized = service.toLowerCase().replace(/[^a-z]/g, "");
    // Add direct keywords for this service
    const mapped = keywordMap[normalized] || [service.toLowerCase()];
    for (const kw of mapped) {
      keywords.add(kw);
    }
  }

  // Add intent keywords - these catch "anyone know a good [anything]?" posts
  for (const intent of intentKeywords) {
    keywords.add(intent);
  }

  return Array.from(keywords);
}

// ============================================
// Helper to get quote page URL for an agent
// ============================================
async function getQuotePageUrl(agentId: string): Promise<string | null> {
  const { data } = await supabase
    .from("quote_pages")
    .select("slug")
    .eq("agent_id", agentId)
    .eq("active", true)
    .single();

  if (!data) return null;
  return `${process.env.NEXT_PUBLIC_APP_URL}/q/${data.slug}`;
}

// ============================================
// Types
// ============================================
interface FacebookPost {
  id: string;
  message: string;
  from?: { name: string; id: string };
  created_time: string;
  permalink: string;
  type?: string;
}
