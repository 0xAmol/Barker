import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const DEMO_AGENT_ID = '43d0d831-5f4a-4fe4-a7d9-f84fb16a2a53'

const posts = [
  {
    agent_id: DEMO_AGENT_ID,
    platform: 'facebook',
    post_url: 'https://facebook.com/groups/houstonhomeowners/posts/demo1',
    post_text: 'Anyone have a recommendation for a good plumber in the Heights area? My kitchen sink is backing up bad and I need someone today if possible. TIA!',
    author_handle: 'Marcus T.',
    location_hint: 'Heights, Houston',
    relevance_score: 0.94,
    intent: 'seeking_service',
    status: 'new',
  },
  {
    agent_id: DEMO_AGENT_ID,
    platform: 'facebook',
    post_url: 'https://facebook.com/groups/montrosemoms/posts/demo2',
    post_text: "Hot water heater just died 😩 anyone trustworthy you've used recently? Hoping to get this sorted before the weekend.",
    author_handle: 'Linda K.',
    location_hint: 'Montrose, Houston',
    relevance_score: 0.91,
    intent: 'asking_recommendation',
    status: 'new',
  },
  {
    agent_id: DEMO_AGENT_ID,
    platform: 'nextdoor',
    post_url: 'https://nextdoor.com/p/demo3',
    post_text: 'Need a plumber for a remodel — adding a half bath. Looking for quotes. Anyone done this recently?',
    author_handle: 'James R.',
    location_hint: 'Heights, Houston',
    relevance_score: 0.87,
    intent: 'seeking_service',
    status: 'new',
  },
]

async function main() {
  // Clear existing demo data first so reruns are clean
  await supabase.from('demand_signals').delete().eq('agent_id', DEMO_AGENT_ID)

  console.log('Seeding demand feed...')
  const { data, error } = await supabase
    .from('demand_signals')
    .insert(posts)
    .select()

  if (error) {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${data.length} demand signals`)
  data.forEach(d => console.log(`  ${d.author_handle} (${d.platform}) — score ${d.relevance_score}`))
}

main().catch(e => { console.error(e); process.exit(1) })
