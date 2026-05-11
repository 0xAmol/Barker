import { createClient } from '@supabase/supabase-js'
import { createAgentWallet, getWalletBalance } from '../src/lib/wallet'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function main() {
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, business_name, wallet_address')
    .is('wallet_address', null)

  if (error) throw error
  if (!agents || agents.length === 0) {
    console.log('No agents need backfilling.')
    return
  }

  console.log(`Backfilling ${agents.length} agents with Solana wallets...\n`)

  for (const agent of agents) {
    try {
      console.log(`Creating wallet for ${agent.business_name} (${agent.id})...`)
      const wallet = await createAgentWallet(agent.id)

      const { error: updateErr } = await supabase
        .from('agents')
        .update({ wallet_address: wallet.address })
        .eq('id', agent.id)

      if (updateErr) {
        console.error(`  ❌ DB update failed:`, updateErr.message)
        continue
      }

      console.log(`  ✓ ${wallet.address}`)
      console.log(`  Explorer: https://explorer.solana.com/address/${wallet.address}?cluster=devnet`)
    } catch (e: any) {
      console.error(`  ❌ Failed:`, e.message)
    }
  }

  console.log(`\nDone.`)
}

main().catch(e => { console.error(e); process.exit(1) })
