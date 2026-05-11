// Create a platform treasury wallet via Crossmint
// Run: npx tsx --env-file=.env.local scripts/create-treasury.ts

import { createAgentWallet } from '../src/lib/wallet'

async function main() {
  console.log('Creating platform treasury wallet...')
  const wallet = await createAgentWallet('platform-treasury')
  console.log(`\n✓ Treasury wallet created!`)
  console.log(`  Address: ${wallet.address}`)
  console.log(`  Signer private key: ${wallet.signerPrivateKey}`)
  console.log(`\nAdd this to your .env.local:`)
  console.log(`  PLATFORM_TREASURY_WALLET=${wallet.address}`)
  console.log(`  TREASURY_SIGNER_KEY=${wallet.signerPrivateKey}`)
}

main().catch((e) => {
  console.error('❌ FAILED:', e.message)
  process.exit(1)
})
