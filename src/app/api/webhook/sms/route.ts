import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseOwnerReply } from "@/lib/notify";

// POST /api/webhook/sms
// Twilio sends incoming SMS here when an owner replies
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
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
      return twimlResponse("Sorry, I don't recognize this number. Text from the phone number you registered with.");
    }

    // Parse the reply
    const parsed = parseOwnerReply(body);

    if (parsed.action === "unknown") {
      return twimlResponse(
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
      return twimlResponse("No pending leads to update.");
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

      // Update agent revenue stats
      await supabase.rpc("increment_agent_revenue", {
        p_agent_id: agent.id,
        p_revenue: parsed.revenue,
      });

      // Log the revenue transaction
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

    // Confirm to owner
    const confirmMessages: Record<string, string> = {
      won: `Got it — marked ${lead.name} as won${parsed.revenue ? ` ($${parsed.revenue})` : ""}. Nice work!`,
      lost: `Marked ${lead.name} as lost. Barker's still hunting for the next one.`,
      contacted: `Marked ${lead.name} as contacted. Let me know how it goes.`,
    };

    return twimlResponse(confirmMessages[parsed.action]);
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}

function twimlResponse(message: string) {
  const xml = `<Response><Message>${message}</Message></Response>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
