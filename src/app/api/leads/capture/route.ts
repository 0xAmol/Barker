import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { notifyNewLead } from "@/lib/notify";
import { LEAD_PRICING } from "@/types";
import type { Agent } from "@/types";

// POST /api/leads/capture
// Called when someone submits the quote form on an agent's landing page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agent_id,
      name,
      phone,
      email,
      service_needed,
      location,
      urgency,
      notes,
      // Attribution
      utm_source,
      utm_medium,
      utm_campaign,
      source_platform,
      source_post_url,
    } = body;

    if (!agent_id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: agent_id, name" },
        { status: 400 }
      );
    }

    // Get the agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Determine lead cost based on service category
    const category = inferCategory(agent.services as string[]);
    const leadCost = LEAD_PRICING[category] || LEAD_PRICING.general;

    // Check if agent has enough credits
    if ((agent as Agent).credit_balance < leadCost) {
      // Still capture the lead but mark as unbilled
      // Send low-credit warning to owner
      console.warn(`Agent ${agent_id} has insufficient credits`);
    }

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        agent_id,
        name,
        phone,
        email,
        service_needed,
        location,
        urgency: urgency || "flexible",
        notes,
        source_platform: source_platform || utm_source,
        source_post_url,
        utm_source,
        utm_medium,
        utm_campaign,
        lead_cost: leadCost,
        billed: (agent as Agent).credit_balance >= leadCost,
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      throw new Error(`Failed to create lead: ${leadError.message}`);
    }

    // Deduct credits if available
    if ((agent as Agent).credit_balance >= leadCost) {
      await supabase
        .from("agents")
        .update({
          credit_balance: (agent as Agent).credit_balance - leadCost,
          total_leads: (agent as Agent).total_leads + 1,
        })
        .eq("id", agent_id);

      // Log the transaction
      await supabase.from("transactions").insert({
        agent_id,
        type: "lead_charge",
        amount: leadCost,
        direction: "outflow",
        currency: "USD",
        lead_id: lead.id,
        description: `Lead: ${name} — ${service_needed || "service inquiry"}`,
      });
    }

    // Notify the owner via SMS
    try {
      await notifyNewLead(agent as Agent, lead);
      await supabase
        .from("leads")
        .update({ owner_notified_at: new Date().toISOString() })
        .eq("id", lead.id);
    } catch (smsError) {
      console.error("SMS notification failed:", smsError);
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      message: "Thank you! We'll be in touch shortly.",
    });
  } catch (error: any) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture lead" },
      { status: 500 }
    );
  }
}

function inferCategory(services: string[]): string {
  const serviceStr = services.join(" ").toLowerCase();
  const categories = Object.keys(LEAD_PRICING);
  for (const cat of categories) {
    if (serviceStr.includes(cat)) return cat;
  }
  return "general";
}
