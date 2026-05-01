import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ingestBusiness } from "@/lib/ingest";
import { buildBrandProfile, generateQuotePage } from "@/lib/ai";
import { createAgentWallet } from "@/lib/wallet";

// POST /api/agent/create
// The one-click install. Paste a Google Business URL, get a Barker agent.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { google_business_url, owner_name, owner_phone, owner_email } = body;

    if (!google_business_url || !owner_name || !owner_phone) {
      return NextResponse.json(
        { error: "Missing required fields: google_business_url, owner_name, owner_phone" },
        { status: 400 }
      );
    }

    // Step 1: Ingest the business profile from Google
    const profile = await ingestBusiness(google_business_url);

    // Step 2: AI builds the brand understanding
    const brand = await buildBrandProfile(profile);

    // Step 3: Create the agent record
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        owner_name,
        owner_phone,
        owner_email,
        business_name: profile.name,
        business_url: google_business_url,
        services: brand.services,
        service_area: brand.service_area,
        reviews_summary: brand.reviews_summary,
        brand_voice: brand.brand_voice,
        pricing_tier: brand.pricing_tier,
        status: "active",
      })
      .select()
      .single();

    if (agentError) {
      throw new Error(`Failed to create agent: ${agentError.message}`);
    }

    // Step 4: Create Solana wallet for the agent (Phase 2)
    let walletAddress: string | null = null;
    try {
      const wallet = await createAgentWallet(agent.id);
      walletAddress = wallet.address;

      // Update wallet address (signer key stored separately if column exists)
      const { error: updateError } = await supabase
        .from("agents")
        .update({ wallet_address: wallet.address })
        .eq("id", agent.id);

      if (updateError) {
        console.warn("Failed to save wallet address:", updateError);
      }

      // Try to store signer key (may fail if column doesn't exist)
      try {
        await supabase
          .from("agents")
          .update({ wallet_signer_key: wallet.signerPrivateKey })
          .eq("id", agent.id);
      } catch {
        console.warn("wallet_signer_key column may not exist");
      }
    } catch (e) {
      // Wallet creation is non-blocking — agent works without it in Phase 1
      console.warn("Wallet creation skipped:", e);
    }

    // Step 5: Generate the quote/landing page
    const quoteCopy = await generateQuotePage(agent);
    const slug = profile.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await supabase.from("quote_pages").insert({
      agent_id: agent.id,
      slug,
      headline: quoteCopy.headline,
      subheadline: quoteCopy.subheadline,
      services_list: quoteCopy.services_list,
      review_highlights: quoteCopy.review_highlights,
      phone_display: profile.phone,
    });

    // Step 6: Discover local Facebook groups to monitor
    let suggestedGroups: any[] = [];
    try {
      const { discoverLocalGroups } = await import("@/lib/scanner");
      suggestedGroups = await discoverLocalGroups(brand.service_area, brand.services);

      // Auto-subscribe to top 5 groups
      if (suggestedGroups.length > 0) {
        const topGroups = suggestedGroups.slice(0, 5).map((g) => ({
          group_id: g.id,
          group_name: g.name,
          group_url: g.url,
        }));

        await supabase.from("agent_channel_settings").insert({
          agent_id: agent.id,
          platform: "facebook",
          enabled: true,
          settings: { monitored_groups: topGroups },
        });
      }
    } catch (e) {
      console.warn("Group discovery skipped:", e);
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        business_name: profile.name,
        services: brand.services,
        service_area: brand.service_area,
        brand_voice: brand.brand_voice,
        wallet_address: walletAddress,
        quote_page: `${process.env.NEXT_PUBLIC_APP_URL}/q/${slug}`,
        monitored_groups: suggestedGroups.slice(0, 5).map((g) => ({
          name: g.name,
          members: g.member_count,
        })),
      },
    });
  } catch (error: any) {
    console.error("Agent creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create agent" },
      { status: 500 }
    );
  }
}
