import { NextRequest, NextResponse } from 'next/server';
import { runTask, runAllActiveAgents } from '@/lib/agents';

// POST /api/agents/run - Run a task for a specific agent or all agents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, task_type, run_all, context } = body;

    // Run all active agents (for cron)
    if (run_all) {
      console.log('[API] Running all active agents...');
      const results = await runAllActiveAgents();
      return NextResponse.json({
        success: true,
        ran: results.ran,
        failed: results.failed,
        results: results.results,
      });
    }

    // Run a specific agent
    if (!business_id) {
      return NextResponse.json(
        { error: 'business_id is required (or use run_all: true)' },
        { status: 400 }
      );
    }

    const validTasks = ['scan_leads', 'generate_content', 'engage_post', 'full_cycle'];
    const taskType = task_type || 'full_cycle';

    if (!validTasks.includes(taskType)) {
      return NextResponse.json(
        { error: `Invalid task_type. Must be one of: ${validTasks.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[API] Running ${taskType} for business: ${business_id}`);
    const results = await runTask(business_id, taskType, context);

    return NextResponse.json({
      success: true,
      business_id,
      task_type: taskType,
      results,
    });
  } catch (error: any) {
    console.error('[API] Failed to run agent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
