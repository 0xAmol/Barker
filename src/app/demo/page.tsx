import { supabase } from '@/lib/supabase'

export const metadata = { title: 'Barker — Live Demo' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEMO_AGENT_ID = '43d0d831-5f4a-4fe4-a7d9-f84fb16a2a53'

async function getMessages() {
  const { data } = await supabase
    .from('demo_messages')
    .select('id, direction, from_number, to_number, body, created_at')
    .eq('agent_id', DEMO_AGENT_ID)
    .order('created_at', { ascending: true })
    .limit(50)
  return data ?? []
}

async function getStats() {
  const [leads, agent] = await Promise.all([
    supabase
      .from('leads')
      .select('status, revenue, created_at')
      .eq('agent_id', DEMO_AGENT_ID)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('agents')
      .select('business_name, owner_phone')
      .eq('id', DEMO_AGENT_ID)
      .single(),
  ])
  const all = leads.data ?? []
  const won = all.filter((l) => l.status === 'won')
  const totalRevenue = won.reduce((sum, l) => sum + (Number(l.revenue) || 0), 0)
  return {
    business_name: agent.data?.business_name ?? 'Demo agent',
    owner_phone: agent.data?.owner_phone ?? '',
    total_leads: all.length,
    won_count: won.length,
    revenue: totalRevenue,
  }
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default async function DemoPage() {
  const [messages, stats] = await Promise.all([getMessages(), getStats()])
  const ownerPhone = stats.owner_phone

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', padding: '24px 16px' }}>
      <meta httpEquiv="refresh" content="3" />

      <div style={{ maxWidth: 880, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E5B547' }} />
            Barker — live demo
          </div>
          <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>Auto-refreshes every 3 seconds</p>
        </header>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          <Stat label="Leads sent" value={stats.total_leads} />
          <Stat label="Won" value={stats.won_count} />
          <Stat label="Pipeline" value={`$${stats.revenue.toLocaleString()}`} />
        </div>

        {/* Phone + thread */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 360, background: '#000', border: '9px solid #1a1a1a', borderRadius: 44, position: 'relative', boxShadow: '0 0 0 1px #2a2a2a inset, 0 30px 80px rgba(229,181,71,0.1)' }}>
            <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 100, height: 24, background: '#000', borderRadius: '0 0 16px 16px', zIndex: 2 }} />

            {/* Status bar */}
            <div style={{ paddingTop: 50, paddingLeft: 24, paddingRight: 24, paddingBottom: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
              <span>9:41</span>
              <span>•••</span>
            </div>

            {/* Thread header */}
            <div style={{ borderTop: '0.5px solid #222', borderBottom: '0.5px solid #222', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1a1a', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐕</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Barker</div>
              <div style={{ fontSize: 10, color: '#888' }}>+1 (346) 770-3761</div>
            </div>

            {/* Messages */}
            <div style={{ padding: '16px 12px 24px', minHeight: 480, maxHeight: 600, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', fontSize: 12, marginTop: 80 }}>
                  No messages yet. Trigger a lead to see the thread.
                </div>
              ) : (
                messages.map((m) => {
                  // From the OWNER's perspective:
                  // outbound = Barker → owner = received (left, gray)
                  // inbound  = owner → Barker = sent (right, gold)
                  const isFromOwner = m.direction === 'inbound'
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isFromOwner ? 'flex-end' : 'flex-start', gap: 2 }}>
                      <div style={{
                        maxWidth: '78%',
                        padding: '8px 12px',
                        borderRadius: 16,
                        background: isFromOwner ? '#E5B547' : '#1c1c1c',
                        color: isFromOwner ? '#000' : '#fff',
                        fontSize: 13,
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {m.body}
                      </div>
                      <div style={{ fontSize: 9, color: '#555', padding: '0 8px' }}>{fmtTime(m.created_at)}</div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '0.5px solid #222', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 18, padding: '8px 14px', fontSize: 12, color: '#666' }}>iMessage</div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 14 }}>↑</div>
            </div>
          </div>
        </div>

        {/* How to test */}
        <div style={{ marginTop: 40, padding: 20, background: '#0c0c0c', borderRadius: 14, fontSize: 13, color: '#888', lineHeight: 1.6 }}>
          <div style={{ fontSize: 11, color: '#E5B547', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Trigger a demo lead</div>
          <code style={{ display: 'block', background: '#000', padding: 12, borderRadius: 8, color: '#ccc', fontSize: 12, overflow: 'auto', whiteSpace: 'pre' }}>{`curl -X POST https://barkerapp.vercel.app/api/leads/capture \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"${DEMO_AGENT_ID}","name":"Sarah M.","service_needed":"Bathroom sink leak","location":"Heights","urgency":"today","source_platform":"facebook"}'`}</code>
          <div style={{ fontSize: 11, color: '#E5B547', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '16px 0 10px' }}>Reply WON</div>
          <code style={{ display: 'block', background: '#000', padding: 12, borderRadius: 8, color: '#ccc', fontSize: 12, overflow: 'auto', whiteSpace: 'pre' }}>{`curl -X POST https://barkerapp.vercel.app/api/webhook/sms \\
  -d "From=${encodeURIComponent(ownerPhone)}" -d "Body=WON 250"`}</code>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: '#0c0c0c', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#E5B547', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#666', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  )
}
