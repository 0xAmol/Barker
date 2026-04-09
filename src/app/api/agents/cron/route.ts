import { NextRequest, NextResponse } from 'next/server';
import { runAllActiveAgents } from '@/lib/agents';

// GET /api/agents/cron - Cron job to run all active agents
// Called every 15 minutes by Vercel Cron
export async function GET(req: NextRequest) {
  // Verify cron secret (optional security measure)
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Starting scheduled agent run...');
    const startTime = Date.now();

    const results = await runAllActiveAgents();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Cron] Completed in ${duration}s - Ran: ${results.ran}, Failed: ${results.failed}`
    );

    // Aggregate results
    const totals = {
      posts_scanned: 0,
      leads_found: 0,
      replies_posted: 0,
      sms_sent: 0,
    };

    for (const result of Object.values(results.results)) {
      totals.posts_scanned += result.posts_scanned;
      totals.leads_found += result.leads_found;
      totals.replies_posted += result.replies_posted;
      totals.sms_sent += result.sms_sent;
    }

    return NextResponse.json({
      success: true,
      duration_seconds: parseFloat(duration),
      agents_ran: results.ran,
      agents_failed: results.failed,
      totals,
    });
  } catch (error: any) {
    console.error('[Cron] Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also support POST for manual triggering
export async function POST(req: NextRequest) {
  return GET(req);
}
