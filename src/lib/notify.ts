import twilio from "twilio";
import type { Agent, Lead } from "@/types";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

// Send a generic SMS
export async function sendSms(to: string, body: string) {
  const message = await client.messages.create({
    body,
    from: FROM_NUMBER,
    to,
  });
  return { sid: message.sid };
}

// Send a new lead notification to the business owner
export async function notifyNewLead(agent: Agent, lead: Lead): Promise<string> {
  const urgencyEmoji: Record<string, string> = {
    today: "🔴 Wants someone today",
    this_week: "🟡 This week",
    this_month: "🟢 This month",
    flexible: "⚪ Flexible timing",
  };

  const body = [
    `🔔 New lead from Barker`,
    ``,
    `${lead.name}`,
    lead.phone ? `📱 ${lead.phone}` : "",
    lead.service_needed ? `🔧 ${lead.service_needed}` : "",
    lead.location ? `📍 ${lead.location}` : "",
    lead.urgency ? urgencyEmoji[lead.urgency] : "",
    lead.source_platform ? `💬 Source: ${lead.source_platform}` : "",
    ``,
    `Reply WON $amount or LOST to update.`,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await client.messages.create({
    body,
    from: FROM_NUMBER,
    to: agent.owner_phone,
  });

  return message.sid;
}

// Send weekly summary to the business owner
export async function sendWeeklySummary(
  agent: Agent,
  stats: {
    leads_count: number;
    won_count: number;
    revenue: number;
    top_source: string;
    credit_balance: number;
  }
): Promise<string> {
  const body = [
    `📊 Barker Weekly Report`,
    ``,
    `${stats.leads_count} leads this week`,
    `${stats.won_count} closed`,
    stats.revenue > 0 ? `+$${stats.revenue.toLocaleString()} revenue` : "",
    `Top source: ${stats.top_source}`,
    ``,
    `Lead credits remaining: $${stats.credit_balance.toFixed(0)}`,
    stats.credit_balance < 30
      ? `⚠️ Low credits — add more to keep Barker working.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const message = await client.messages.create({
    body,
    from: FROM_NUMBER,
    to: agent.owner_phone,
  });

  return message.sid;
}

// Parse an incoming SMS reply from the owner
// Handles: "WON 400", "WON $1200", "LOST", "CALLED"
export function parseOwnerReply(body: string): {
  action: "won" | "lost" | "contacted" | "unknown";
  revenue?: number;
} {
  const text = body.trim().toUpperCase();

  if (text.startsWith("WON")) {
    const amount = text.match(/[\d,]+\.?\d*/);
    return {
      action: "won",
      revenue: amount ? parseFloat(amount[0].replace(",", "")) : undefined,
    };
  }

  if (text.startsWith("LOST") || text.startsWith("NO")) {
    return { action: "lost" };
  }

  if (text.startsWith("CALLED") || text.startsWith("CONTACT")) {
    return { action: "contacted" };
  }

  return { action: "unknown" };
}
