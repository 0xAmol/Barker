import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { scanForDemand } from "@/lib/scanner";
import type { Agent } from "@/types";

// POST /api/agent/scan
// Triggered by Vercel Cron every 15 minutes
// Scans Facebook groups for demand signals across all active agents
export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .eq("status", "active")
    .gt("credit_balance", 0); // Only scan for agents with credits

  if (error || !agents) {
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }

  const results = [];

  for (const agent of agents) {
    try {
      const signals = await scanForDemand(agent as Agent);
      results.push({
        agent_id: agent.id,
        business: agent.business_name,
        signals_found: signals.length,
        engaged: signals.filter((s) => s.status === "engaged").length,
      });
    } catch (err: any) {
      console.error(`Scan failed for agent ${agent.id}:`, err.message);
      results.push({
        agent_id: agent.id,
        business: agent.business_name,
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    scanned: agents.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
