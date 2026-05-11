// Crossmint end-to-end smoke test
// Run from ~/barker with: npx tsx --env-file=.env.local scripts/crossmint-smoke-test.ts

import {
  createAgentWallet,
  getWalletBalance,
  fundAgentWallet,
  chargeForLead,
} from '../src/lib/wallet'

const CROSSMINT_API = process.env.CROSSMINT_API_URL || 'https://staging.crossmint.com/api/v1-alpha2'
const CROSSMINT_KEY = process.env.CROSSMINT_API_KEY!
const TREASURY = process.env.PLATFORM_TREASURY_WALLET!

function ts() {
  return new Date().toISOString().slice(11, 19)
}

async function pollTransaction(walletAddress: string, txId: string, maxWaitMs = 90000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    const r = await fetch(`${CROSSMINT_API}/wallets/${walletAddress}/transactions/${txId}`, {
      headers: { 'X-API-KEY': CROSSMINT_KEY },
    })
    const data = await r.json()
    const status = data.status
    const onChainSig = data.onChain?.txId
    console.log(`  [${ts()}] poll: status=${status}${onChainSig ? ` sig=${onChainSig}` : ''}`)
    if (status === 'success' || status === 'failed') return data
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error(`Transaction ${txId} did not settle within ${maxWaitMs}ms`)
}

async function main() {
  console.log(`[${ts()}] Treasury wallet: ${TREASURY}`)
  console.log(`[${ts()}] Crossmint API: ${CROSSMINT_API}`)

  console.log(`\n[${ts()}] Checking treasury balance...`)
  const treasuryBalance = await getWalletBalance(TREASURY)
  console.log(`[${ts()}] ✓ Treasury balance: ${treasuryBalance} USDC`)
  if (treasuryBalance < 1) {
    console.error(`❌ Treasury has insufficient balance (need 1+ USDC).`)
    console.error(`   Fund the treasury wallet on Crossmint staging:`)
    console.error(`   https://staging.crossmint.com/console`)
    process.exit(1)
  }

  const agentId = `smoketest-${Date.now()}`
  console.log(`\n[${ts()}] Creating wallet for agent ${agentId}...`)
  const t1 = Date.now()
  const wallet = await createAgentWallet(agentId)
  console.log(`[${ts()}] ✓ Wallet created (${Date.now() - t1}ms): ${wallet.address}`)
  console.log(`  Explorer: https://explorer.solana.com/address/${wallet.address}?cluster=devnet`)

  console.log(`\n[${ts()}] Funding wallet with 0.5 USDC from treasury...`)
  const t2 = Date.now()
  const fundTx = await fundAgentWallet(wallet.address, 0.5)
  console.log(`[${ts()}] Transfer queued (${Date.now() - t2}ms): id=${fundTx.id} status=${fundTx.status}`)
  const fundResult = await pollTransaction(TREASURY, fundTx.id)
  const fundSig = fundResult.onChain?.txId
  console.log(`[${ts()}] ✓ Funding settled. txhash: ${fundSig}`)
  if (fundSig) console.log(`  Explorer: https://explorer.solana.com/tx/${fundSig}?cluster=devnet`)

  console.log(`\n[${ts()}] Checking agent balance...`)
  await new Promise((r) => setTimeout(r, 5000))
  const balance1 = await getWalletBalance(wallet.address)
  console.log(`[${ts()}] ✓ Agent balance: ${balance1} USDC`)

  console.log(`\n[${ts()}] Charging 0.25 USDC for lead...`)
  const t3 = Date.now()
  const chargeTx = await chargeForLead(wallet.address, 0.25)
  console.log(`[${ts()}] Charge queued (${Date.now() - t3}ms): id=${chargeTx.id} status=${chargeTx.status}`)
  const chargeResult = await pollTransaction(wallet.address, chargeTx.id)
  const chargeSig = chargeResult.onChain?.txId
  console.log(`[${ts()}] ✓ Charge settled. txhash: ${chargeSig}`)
  if (chargeSig) console.log(`  Explorer: https://explorer.solana.com/tx/${chargeSig}?cluster=devnet`)

  await new Promise((r) => setTimeout(r, 5000))
  const balance2 = await getWalletBalance(wallet.address)
  console.log(`\n[${ts()}] ✓ Final agent balance: ${balance2} USDC`)

  console.log(`\n=== END-TO-END WORKED ===`)
  console.log(`Agent wallet: ${wallet.address}`)
  console.log(`Fund tx:      ${fundSig || '(no on-chain signature)'}`)
  console.log(`Charge tx:    ${chargeSig || '(no on-chain signature)'}`)
}

main().catch((e) => {
  console.error('\n❌ FAILED:', e.message)
  process.exit(1)
})
