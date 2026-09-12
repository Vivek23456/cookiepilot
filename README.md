# 🍪 CookiePilot

> An AI-powered agent interface for interacting with Cookie Chain and Solana through the `cookie-mcp` Model Context Protocol server.

CookiePilot turns natural-language requests into structured blockchain operations through an MCP-powered agent layer.

Instead of manually interacting with RPC endpoints, token mints, quote APIs, and blockchain tools, users can communicate with CookiePilot using requests such as:

```text
Check Cookie Chain health

Show me staking information

Give me a quote for a $10 COOK to USDC swap

Execute a $10 COOK to USDC swap

✨ Features
🔌 MCP Integration

CookiePilot connects to the local cookie-mcp server through stdio.

This provides access to Cookie Chain and supported Solana operations without exposing blockchain credentials to the agent layer.

🤖 Natural-Language Agent Routing

User requests are translated into MCP tool calls.

Examples:

User request	MCP tool
Check chain health	chain_health
Show staking information	stake_info
Check wallet balance	get_balance
Give me a COOK/USDC quote	get_quote
Execute a COOK/USDC swap	trade
Find token information	search_tokens / get_token_info

💱 Swap Quotes

CookiePilot supports quote requests for token swaps.

For example:

Give me a quote for a $10 COOK to USDC swap

The agent resolves the appropriate token mints and routes the request to the MCP quote engine.

Solana COOK currently uses the bridged SPL COOK token:

36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1

USDC:

EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
🔄 Trade Execution

Explicit execution requests can be routed to the MCP trade tool.

Example:

Execute a $10 COOK to USDC swap

The underlying MCP server handles quoting, transaction construction, simulation, signing, submission, and confirmation.

⚠️ Trade execution requires a configured wallet and Solana RPC endpoint.

🛡️ Safety-Oriented Architecture

CookiePilot separates natural-language interpretation from blockchain execution.

Private keys are not placed in prompts or API requests.

Wallet credentials remain in the local MCP environment.

Money-moving operations should only be triggered by explicit user intent.

# Architecture

                         ┌─────────────────────┐
                         │       User          │
                         │                     │
                         │ "Swap $10 COOK..."  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     CookiePilot     │
                         │                     │
                         │  Express API        │
                         │  Agent Router       │
                         └──────────┬──────────┘
                                    │
                                    │ MCP / stdio
                                    ▼
                         ┌─────────────────────┐
                         │      cookie-mcp     │
                         │                     │
                         │ Token tools         │
                         │ Quote tools         │
                         │ Trade tools         │
                         │ Wallet tools        │
                         │ Staking tools       │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
             ┌───────────────┐             ┌───────────────┐
             │ Cookie Chain  │             │    Solana     │
             │      RPC      │             │      RPC      │
             └───────────────┘             └───────────────┘


#Project Structure

cookiepilot/
│
├── server/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── router.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── index.ts
│   │   └── mcp-client.ts
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md

▶️ Running CookiePilot
cd ~/Projects/cookiepilot/server
npm run dev

The API runs on:

http://localhost:3001
❤️ Health Check
curl http://localhost:3001/health

Expected:

{
  "ok": true,
  "service": "cookiepilot-api"
}
🔧 MCP Tools
curl http://localhost:3001/api/tools

CookiePilot uses the MCP tool definitions as the source of truth for available operations and arguments.

💬 Agent API
Request
POST /api/chat

Example:

curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Check Cookie Chain health"}'

Quote:

curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Give me a quote for a $10 COOK to USDC swap"}'

Execution:

curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Execute a $10 COOK to USDC swap"}'
🧠 Agent Routing
Natural Language
       │
       ▼
Intent Detection
       │
       ├── Chain health ───────► chain_health
       ├── Staking ─────────────► stake_info
       ├── Balance ─────────────► get_balance
       ├── Token lookup ────────► search_tokens
       ├── Quote ───────────────► get_quote
       └── Trade ───────────────► trade

Quote requests and execution requests are deliberately separated.

"Give me a quote"
        ↓
     get_quote
        ↓
     No trade

Whereas:

"Execute the swap"
        ↓
       trade
🧪 Development

Start development server:

cd server
npm run dev

Type check:

npx tsc --noEmit
🗺️ Roadmap
Phase 1 — Core Agent
 Express API
 MCP stdio client
 MCP tool discovery
 Chain health
 Staking information
 Wallet balance
 Natural-language routing
 Swap quote routing
 COOK → USDC Solana routing
 Trade tool integration
Phase 2 — Token Intelligence
 Automatic search_tokens resolution
 get_token_info
 Token-symbol disambiguation
 Multi-chain token resolution
 Pool discovery
Phase 3 — Transaction Safety
 Explicit transaction confirmation
 Transaction preview
 Slippage controls
 Spend-limit enforcement
 Transaction status tracking
 Human-readable transaction summaries
Phase 4 — DeFi Operations
 Transfers
 Staking
 Unstaking
 Pool information
 Liquidity operations
Phase 5 — NFT & Web3
 NFT discovery
 NFT metadata
 Cookie Chain domains
 Launchpad interactions
Phase 6 — User Interface
 Web chat interface
 Wallet dashboard
 Token balances
 Quote cards
 Transaction history
 Transaction confirmation UI
 Portfolio overview
🎯 Project Goal

CookiePilot aims to make blockchain interaction accessible through an agent interface while preserving the safety properties required for financial operations.

The long-term execution flow is:

Natural Language
       ↓
Agent
       ↓
Intent + Validation
       ↓
MCP Tool Selection
       ↓
Simulation / Preview
       ↓
User Confirmation
       ↓
Blockchain Execution
       ↓
Transaction Result

The agent handles blockchain infrastructure complexity while keeping important financial decisions visible and controllable by the user.

🤝 Contributing

Contributions are welcome.

Before submitting a pull request:

Keep secrets out of the repository.
Do not commit node_modules.
Add tests for new routing behavior.
Preserve explicit confirmation for money-moving operations.
Document new MCP tools and parameters.
⚠️ Disclaimer

CookiePilot is experimental software.

Blockchain transactions can result in permanent loss of funds. Always verify wallet addresses, token contracts, transaction amounts, slippage, network, and transaction results.

Never expose private keys or seed phrases.

License

License information will be added as the project matures.
EOF

git add README.md .gitignore
git commit -m "docs: improve project README"
git push


One correction from the earlier README: **don't claim `search_tokens` is already implemented if our router doesn't have it yet.** I've marked it as roadmap work above. That keeps the GitHub README honest while we're still building it.