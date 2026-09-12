# 🍪 CookiePilot

> An AI-powered agent interface for interacting with Cookie Chain and Solana through the `cookie-mcp` Model Context Protocol server.

CookiePilot turns natural-language requests into structured blockchain operations through an MCP-powered agent layer.

Instead of manually interacting with RPC endpoints, token mints, quote APIs, and blockchain tools, users can communicate with CookiePilot using requests such as:

```text
Check Cookie Chain health

Show me staking information

Give me a quote for a $10 COOK to USDC swap

Execute a $10 COOK to USDC swap
```

---

## ✨ Features

### 🔌 MCP Integration

CookiePilot connects to the local `cookie-mcp` server through stdio.

This provides access to Cookie Chain and supported Solana operations while keeping blockchain credentials inside the local MCP environment.

### 🤖 Natural-Language Agent Routing

User requests are translated into structured MCP tool calls.

| User request             | MCP tool                           |
| ------------------------ | ---------------------------------- |
| Check chain health       | `chain_health`                     |
| Show staking information | `stake_info`                       |
| Check wallet balance     | `get_balance`                      |
| Get a COOK/USDC quote    | `get_quote`                        |
| Execute a COOK/USDC swap | `trade`                            |
| Find token information   | `search_tokens` / `get_token_info` |

### 💱 Swap Quotes

CookiePilot supports natural-language token swap quote requests.

Example:

```text
Give me a quote for a $10 COOK to USDC swap
```

The agent converts the request into the parameters required by the MCP quote engine.

For the current Solana COOK → USDC route:

**Bridged SPL COOK**

```text
36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1
```

**USDC**

```text
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### 🔄 Trade Execution

Explicit execution requests can be routed to the MCP `trade` tool.

Example:

```text
Execute a $10 COOK to USDC swap
```

The underlying MCP server handles transaction construction, simulation, signing, submission, and confirmation.

> ⚠️ Trade execution requires a configured wallet and dedicated Solana RPC endpoint.

### 🛡️ Safety-Oriented Architecture

CookiePilot separates natural-language interpretation from blockchain execution.

* Private keys are not included in prompts.
* Private keys are not sent through the API.
* Wallet credentials remain in the local MCP environment.
* Quote requests do not execute trades.
* Money-moving operations require explicit execution intent.
* Transactions are simulated before submission by the underlying MCP execution layer.

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         │                     │
                         │ "Swap $10 COOK..."  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     CookiePilot     │
                         │                     │
                         │   Express API       │
                         │   Agent Router      │
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
```

---

# 📁 Project Structure

```text
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
```

### Core Components

**`server/src/index.ts`**

Express API entry point.

**`server/src/mcp-client.ts`**

Creates the connection between CookiePilot and `cookie-mcp` over stdio.

**`server/src/agent/router.ts`**

Natural-language intent routing layer that determines which MCP tool should be called and constructs its arguments.

**`server/src/agent/types.ts`**

Type definitions for the agent layer.

---

# 🚀 Getting Started

## Requirements

* Node.js
* npm
* Yarn
* Git
* `cookie-mcp`
* Cookie Chain RPC
* Dedicated Solana RPC for Solana trade execution

---

## 1. Clone the Repository

```bash
git clone https://github.com/Vivek23456/cookiepilot.git
cd cookiepilot
```

---

## 2. Install CookiePilot

```bash
cd server
npm install
```

---

## 3. Install `cookie-mcp`

CookiePilot currently expects `cookie-mcp` to be available locally.

```bash
cd ~/Projects/cookie-mcp
yarn install
```

The current MCP client configuration expects:

```text
/home/vivek/Projects/cookie-mcp
```

If `cookie-mcp` is located elsewhere, update the MCP client configuration accordingly.

---

# 🔐 Environment Configuration

CookiePilot relies on `cookie-mcp` for blockchain credentials.

Example:

```bash
export COOKIE_PRIVATE_KEY="..."
export SOLANA_RPC_URL="..."
```

Additional configuration can include:

```bash
export COOKIE_RPC_URL="..."
export COOKIE_SLIPPAGE_BPS="..."
export COOKIE_MAX_TRADE_COOK="..."
export JUPITER_API_KEY="..."
```

### Security

Never commit:

```text
node_modules/
.env
server/.env
dist/
server/dist/
```

Never commit or share:

* Private keys
* Seed phrases
* RPC API keys
* Other blockchain credentials

---

# ▶️ Running CookiePilot

Start the development server:

```bash
cd ~/Projects/cookiepilot/server
npm run dev
```

The API runs on:

```text
http://localhost:3001
```

---

# ❤️ Health Check

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "ok": true,
  "service": "cookiepilot-api"
}
```

---

# 🔧 MCP Tools

List the tools exposed by `cookie-mcp`:

```bash
curl http://localhost:3001/api/tools
```

CookiePilot uses the MCP tool definitions as the source of truth for available tools and their parameters.

---

# 💬 Agent API

CookiePilot exposes a natural-language endpoint:

```text
POST /api/chat
```

## Chain Health

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Check Cookie Chain health"}'
```

## Swap Quote

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Give me a quote for a $10 COOK to USDC swap"}'
```

## Trade Execution

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Execute a $10 COOK to USDC swap"}'
```

---

# 🧠 Agent Routing

CookiePilot follows a natural-language → intent → MCP-tool pipeline.

```text
Natural Language
       │
       ▼
Intent Detection
       │
       ├── Chain health ───────► chain_health
       │
       ├── Staking ─────────────► stake_info
       │
       ├── Balance ─────────────► get_balance
       │
       ├── Token lookup ────────► search_tokens
       │
       ├── Quote ───────────────► get_quote
       │
       └── Trade ───────────────► trade
```

Quote requests and execution requests are deliberately separated.

### Quote

```text
"Give me a quote"
        │
        ▼
    get_quote
        │
        ▼
   No transaction
```

### Execution

```text
"Execute the swap"
        │
        ▼
       trade
        │
        ▼
 Blockchain transaction
```

This distinction prevents an informational quote request from unintentionally becoming a financial transaction.

---

# 💱 Token Routing

CookiePilot distinguishes between token representations on different chains.

For the current COOK → USDC Solana route:

```text
        COOK
          │
          │ Bridged SPL COOK
          ▼
       Solana
          │
          │ Jupiter routing
          ▼
         USDC
```

The agent should not blindly assume that a token symbol maps to the same mint across chains.

The planned token-resolution flow is:

```text
Token Symbol
     │
     ▼
search_tokens
     │
     ▼
Resolved Token
     │
     ├──► get_token_info
     │
     ├──► get_quote
     │
     └──► trade
```

---

# 🧪 Development

Start the development server:

```bash
cd server
npm run dev
```

Run TypeScript type checking:

```bash
npx tsc --noEmit
```

---

# 🗺️ Roadmap

## Phase 1 — Core Agent

* [x] Express API
* [x] MCP stdio client
* [x] MCP tool discovery
* [x] Chain health
* [x] Staking information
* [x] Wallet balance
* [x] Natural-language routing
* [x] Swap quote routing
* [x] COOK → USDC Solana routing
* [x] Trade tool integration

## Phase 2 — Token Intelligence

* [ ] Automatic `search_tokens` resolution
* [ ] `get_token_info`
* [ ] Token-symbol disambiguation
* [ ] Multi-chain token resolution
* [ ] Pool discovery

## Phase 3 — Transaction Safety

* [ ] Explicit transaction confirmation
* [ ] Transaction preview
* [ ] Slippage controls
* [ ] Spend-limit enforcement
* [ ] Transaction status tracking
* [ ] Human-readable transaction summaries

## Phase 4 — DeFi Operations

* [ ] Transfers
* [ ] Staking
* [ ] Unstaking
* [ ] Pool information
* [ ] Liquidity operations

## Phase 5 — NFT & Web3

* [ ] NFT discovery
* [ ] NFT metadata
* [ ] Cookie Chain domains
* [ ] Launchpad interactions

## Phase 6 — User Interface

* [ ] Web chat interface
* [ ] Wallet dashboard
* [ ] Token balances
* [ ] Quote cards
* [ ] Transaction history
* [ ] Transaction confirmation UI
* [ ] Portfolio overview

---

# 🎯 Project Goal

CookiePilot aims to make blockchain interaction accessible through an agent interface while preserving the safety properties required for financial operations.

The long-term execution flow is:

```text
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
```

The goal is to hide unnecessary blockchain infrastructure complexity while keeping important financial decisions visible and controllable by the user.

---

# 🤝 Contributing

Contributions are welcome.

Before submitting a pull request:

1. Keep secrets out of the repository.
2. Do not commit `node_modules`.
3. Add tests for new routing behavior.
4. Preserve explicit intent handling for money-moving operations.
5. Document new MCP tools and parameters.
6. Run TypeScript checks before submitting changes.

---

# ⚠️ Disclaimer

CookiePilot is experimental software.

Blockchain transactions are irreversible and may result in permanent loss of funds.

Always verify:

* Wallet addresses
* Token contracts
* Transaction amounts
* Slippage
* Network
* Transaction results

Never expose private keys or seed phrases.

---

# 📄 License

License information will be added as the project matures.
