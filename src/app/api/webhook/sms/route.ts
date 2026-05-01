import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseOwnerReply } from "@/lib/notify";

const DEMO_MODE = process.env.DEMO_MODE === "true";

// POST /api/webhook/sms
// Twilio sends incoming SMS here when an owner replies.
// In demo mode, can also be called directly with form data to simulate a reply.
export async function POST(req: NextRequest) {
  try {
    const formData: any = await req.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;

    if (!from || !body) {
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Find the agent by owner phone
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("owner_phone", from)
      .single();

    if (!agent) {
      return twimlResponse(
        "Sorry, I don't recognize this number. Text from the phone number you registered with."
      );
    }

    // Log inbound message in demo mode
    if (DEMO_MODE) {
      await supabase.from("demo_messages").insert({
        direction: "inbound",
        from_number: from,
        to_number: process.env.TWILIO_PHONE_NUMBER!,
        body,
        agent_id: agent.id,
      });
    }

    // Parse the reply
    const parsed = parseOwnerReply(body);

    if (parsed.action === "unknown") {
      return replyAndLog(
        agent.id,
        from,
        "I didn't catch that. Reply WON $amount, LOST, or CALLED to update your latest lead."
      );
    }

    // Find the most recent unresolved lead for this agent
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, service_needed")
      .eq("agent_id", agent.id)
      .in("status", ["new", "contacted"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lead) {
      return replyAndLog(agent.id, from, "No pending leads to update.");
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      won: "won",
      lost: "lost",
      contacted: "contacted",
    };

    const updateData: Record<string, any> = {
      status: statusMap[parsed.action],
      owner_responded_at: new Date().toISOString(),
    };

    if (parsed.action === "won" && parsed.revenue) {
      updateData.revenue = parsed.revenue;

      await supabase.rpc("increment_agent_revenue", {
        p_agent_id: agent.id,
        p_revenue: parsed.revenue,
      });

      await supabase.from("transactions").insert({
        agent_id: agent.id,
        type: "lead_charge",
        amount: parsed.revenue,
        direction: "inflow",
        currency: "USD",
        lead_id: lead.id,
        description: `Won: ${lead.name} — $${parsed.revenue}`,
      });
    }

    await supabase.from("leads").update(updateData).eq("id", lead.id);

    const confirmMessages: Record<string, string> = {
      won: `Got it — marked ${lead.name} as won${
        parsed.revenue ? ` ($${parsed.revenue})` : ""
      }. Nice work!`,
      lost: `Marked ${lead.name} as lost. Barker's still hunting for the next one.`,
      contacted: `Marked ${lead.name} as contacted. Let me know how it goes.`,
    };

    return replyAndLog(agent.id, from, confirmMessages[parsed.action]);
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}

// Helper: returns TwiML response AND logs the auto-reply to demo_messages in demo mode
async function replyAndLog(agent_id: string, to: string, message: string) {
  if (DEMO_MODE) {
    await supabase.from("demo_messages").insert({
      direction: "outbound",
      from_number: process.env.TWILIO_PHONE_NUMBER!,
      to_number: to,
      body: message,
      agent_id,
    });
  }
  return twimlResponse(message);
}

function twimlResponse(message: string) {
  const xml = `<Response><Message>${message}</Message></Response>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
