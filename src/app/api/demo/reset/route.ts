import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const DEMO_AGENT_ID = '43d0d831-5f4a-4fe4-a7d9-f84fb16a2a53'

// POST /api/demo/reset — wipes demo_messages + resets test leads for the demo agent
export async function POST() {
  if (process.env.DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'demo mode only' }, { status: 403 })
  }

  const [msgs, leads] = await Promise.all([
    supabase.from('demo_messages').delete().eq('agent_id', DEMO_AGENT_ID),
    supabase.from('leads').delete().eq('agent_id', DEMO_AGENT_ID),
  ])

  return NextResponse.json({
    messages_deleted: msgs.count ?? 'ok',
    leads_deleted: leads.count ?? 'ok',
  })
}
