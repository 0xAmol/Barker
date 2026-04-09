import { NextRequest, NextResponse } from 'next/server';
import {
  createBarkerAgent,
  getOrCreateAgent,
  listActiveAgents,
  pauseAgent,
  resumeAgent,
  deleteBarkerAgent,
} from '@/lib/agents';

// GET /api/agents - List all active agents
export async function GET() {
  try {
    const agents = await listActiveAgents();
    return NextResponse.json({ agents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents - Create a new agent for a business
export async function POST(req: NextRequest) {
  try {
    const { business_id } = await req.json();

    if (!business_id) {
      return NextResponse.json(
        { error: 'business_id is required' },
        { status: 400 }
      );
    }

    const agent = await getOrCreateAgent(business_id);

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        anthropic_agent_id: agent.anthropic_agent_id,
        status: agent.status,
        created_at: agent.created_at,
      },
    });
  } catch (error: any) {
    console.error('[API] Failed to create agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/agents - Update agent status (pause/resume)
export async function PATCH(req: NextRequest) {
  try {
    const { business_id, action } = await req.json();

    if (!business_id || !action) {
      return NextResponse.json(
        { error: 'business_id and action are required' },
        { status: 400 }
      );
    }

    if (action === 'pause') {
      await pauseAgent(business_id);
    } else if (action === 'resume') {
      await resumeAgent(business_id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/agents - Delete an agent
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const business_id = searchParams.get('business_id');

    if (!business_id) {
      return NextResponse.json(
        { error: 'business_id is required' },
        { status: 400 }
      );
    }

    await deleteBarkerAgent(business_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
