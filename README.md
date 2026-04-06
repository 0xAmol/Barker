# Barker — AI Salesman

> Install him. Fund him once. Watch him sell.

Barker is an autonomous AI sales agent for service businesses. Paste your Google Business URL — Barker learns your business, finds people who need your services across social platforms, captures leads, and texts them to you. Every dollar earned can be reinvested automatically through an on-chain Solana wallet.

**Built for the Solana Frontier Hackathon (April–May 2026)**

## How it works

1. **Paste your Google Business URL** — Barker ingests your reviews, services, service area, and brand voice
2. **Barker auto-discovers local Facebook groups** — "Katy TX Homeowners," "Houston Recommendations," etc.
3. **Barker scans every 15 minutes** — Finds posts like "anyone know a good plumber?"
4. **Barker replies** — Context-aware, helpful comment with a link to your auto-generated quote page
5. **Lead captured** — Someone submits the form: name, phone, service needed, location, urgency
6. **You get a text** — Call the lead, close the deal, reply "WON $400" to log it

## Architecture

```
Dave (Plumber)                    Barker Agent
├── Pastes Google URL ──────────► Ingests business profile (Claude AI)
│                                 Discovers local FB groups
│                                 Generates quote page
│                                 ↓
│                                 Scans FB groups every 15 min
│                                 Finds "anyone know a plumber?" posts
│                                 Replies with helpful context + quote link
│                                 ↓
├── Gets SMS lead ◄──────────── Someone fills out quote form
├── Calls Maria, fixes sink
├── Replies "WON $400" ────────► Logs revenue, updates lead sheet
└── Taps "Withdraw" ◄──────────  USDC → USD via Crossmint offramp

On-chain (Solana):
├── Agent wallet (USDC-SPL via Crossmint smart wallets)
├── Lead charges (agent → platform treasury)
├── Ad spend (agent → escrow)
└── Referral bounties (agent → agent)
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Database | Supabase (Postgres) |
| AI | Claude API (Sonnet) |
| SMS | Twilio |
| Wallets | Crossmint (Solana smart wallets) |
| Blockchain | Solana (USDC-SPL) |
| Hosting | Vercel |

## Project structure

```
barker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/create/    # One-click agent setup
│   │   │   ├── agent/scan/      # Cron: scan FB groups for demand
│   │   │   ├── leads/capture/   # Quote form submission
│   │   │   └── webhook/sms/     # Twilio incoming SMS
│   │   ├── q/[slug]/            # Auto-generated quote pages
│   │   └── dashboard/           # Agent dashboard
│   ├── lib/
│   │   ├── ai.ts                # Claude API — brand learning, content gen, demand analysis
│   │   ├── ingest.ts            # Google Business profile scraper
│   │   ├── scanner.ts           # Facebook Groups demand scanner
│   │   ├── notify.ts            # Twilio SMS notifications
│   │   ├── wallet.ts            # Crossmint wallet integration
│   │   └── supabase.ts          # Database client
│   └── types/
│       └── index.ts             # TypeScript types + lead pricing
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_channel_settings.sql
├── vercel.json                  # Cron: scan every 15 min
├── public/
└── .env.example
```

## Database schema

6 tables: `agents`, `leads`, `content_queue`, `transactions`, `quote_pages`, `demand_signals`

See `supabase/migrations/001_initial_schema.sql` for full schema.

## Setup

```bash
# Clone and install
git clone https://github.com/your-org/barker.git
cd barker
npm install

# Configure environment
cp .env.example .env.local
# Fill in your API keys

# Set up database
npx supabase init
npx supabase db push

# Run
npm run dev
```

## Phases

### Phase 1 — Organic leads (no wallet)
Barker finds demand, engages, captures leads, texts owner. Dave pays via Stripe. No crypto involved.

### Phase 2 — Self-funding loop (Solana wallet)
Agent gets a Crossmint smart wallet. Revenue flows as USDC-SPL. Barker reinvests into paid ads autonomously. The flywheel compounds.

### Phase 3 — Agent marketplace
Barker-to-Barker lead referrals with on-chain bounty settlement. Autonomous economic agents trading with each other.

## Hackathon criteria alignment

| Criteria | How Barker addresses it |
|---|---|
| Functionality | Full loop: URL → ingest → find demand → engage → capture → notify → track |
| Potential Impact | 33M+ US small businesses with zero marketing infrastructure |
| Novelty | Autonomous AI agent with its own Solana wallet — earns, spends, reinvests |
| UX | Solana enables instant micropayment settlement invisible to the end user |
| Open Source | Full repo, MIT license, composable wallet primitive |
| Business Plan | Per-lead pricing, prepaid credits, 70-80% gross margins |

## License

MIT
