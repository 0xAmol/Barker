// Agent wallet management via Crossmint
// Creates and manages USDC-SPL wallets on Solana for each Barker agent

const CROSSMINT_API = process.env.CROSSMINT_API_URL || "https://staging.crossmint.com/api/2022-06-09";
const CROSSMINT_KEY = process.env.CROSSMINT_API_KEY!;

interface WalletResponse {
  address: string;
  type: string;
  linkedUser?: string;
}

interface TransferResponse {
  id: string;
  status: string;
  onChain?: {
    txId: string;
    chain: string;
  };
}

// Create a new Solana smart wallet for a Barker agent
export async function createAgentWallet(agentId: string): Promise<string> {
  const res = await fetch(`${CROSSMINT_API}/wallets`, {
    method: "POST",
    headers: {
      "X-API-KEY": CROSSMINT_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "solana-smart-wallet",
      linkedUser: `agent:${agentId}`,
      config: {
        adminSigner: { type: "solana-keypair" },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Crossmint wallet creation failed: ${res.status} ${await res.text()}`);
  }

  const data: WalletResponse = await res.json();
  return data.address;
}

// Get wallet balance (USDC-SPL)
export async function getWalletBalance(walletAddress: string): Promise<number> {
  const res = await fetch(
    `${CROSSMINT_API}/wallets/${walletAddress}/balances`,
    {
      headers: { "X-API-KEY": CROSSMINT_KEY },
    }
  );

  if (!res.ok) return 0;

  const data = await res.json();
  // Find USDC balance
  const usdc = data.balances?.find(
    (b: any) => b.currency === "usdc" || b.token === "USDC"
  );
  return usdc ? parseFloat(usdc.amount) : 0;
}

// Transfer USDC between wallets (agent → platform, agent → agent)
export async function transferUSDC(
  fromWallet: string,
  toWallet: string,
  amount: number,
  description?: string
): Promise<TransferResponse> {
  const res = await fetch(
    `${CROSSMINT_API}/wallets/${fromWallet}/transactions`,
    {
      method: "POST",
      headers: {
        "X-API-KEY": CROSSMINT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        params: {
          calls: [
            {
              method: "transfer",
              params: {
                to: toWallet,
                amount: amount.toString(),
                currency: "usdc",
                chain: "solana",
              },
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Crossmint transfer failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

// Fund agent wallet from platform treasury
// Used when Dave buys lead credits and they convert to USDC
export async function fundAgentWallet(
  agentWalletAddress: string,
  amount: number
): Promise<TransferResponse> {
  const platformTreasury = process.env.PLATFORM_TREASURY_WALLET!;
  return transferUSDC(platformTreasury, agentWalletAddress, amount, "credit_purchase");
}

// Charge agent wallet for a delivered lead (agent → platform)
export async function chargeForLead(
  agentWalletAddress: string,
  leadCost: number
): Promise<TransferResponse> {
  const platformTreasury = process.env.PLATFORM_TREASURY_WALLET!;
  return transferUSDC(agentWalletAddress, platformTreasury, leadCost, "lead_charge");
}

// Agent-to-agent referral bounty transfer
export async function payReferralBounty(
  fromAgentWallet: string,
  toAgentWallet: string,
  bountyAmount: number
): Promise<TransferResponse> {
  return transferUSDC(fromAgentWallet, toAgentWallet, bountyAmount, "referral_bounty");
}
