import { callMcpTool } from "../mcp-client.js";

export type AgentResponse = {
  tool: string | null;
  args?: Record<string, unknown>;
  response: unknown;
};

const COOKIE_COOK_MINT =
  "So11111111111111111111111111111111111111112";

const SOLANA_COOK_MINT =
  "36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1";

const SOLANA_USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

function extractAmount(message: string): number | null {
  const dollarMatch = message.match(/\$\s*(\d+(?:\.\d+)?)/);

  if (dollarMatch) {
    const amount = Number(dollarMatch[1]);

    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  const amountMatch = message.match(
    /\b(?:amount|for)\s+(\d+(?:\.\d+)?)\b/i,
  );

  if (amountMatch) {
    const amount = Number(amountMatch[1]);

    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  return null;
}

function extractSwapPair(
  message: string,
): {
  inputToken: string;
  outputToken: string;
} | null {
  const match = message.match(
    /\b(?:COOK|USDC|SOL|MON|COOKIE)\s*(?:to|->|→)\s*(?:COOK|USDC|SOL|MON|COOKIE)\b/i,
  );

  if (!match) {
    return null;
  }

  const parts = match[0]
    .split(/\s*(?:to|->|→)\s*/i)
    .map((token) => token.trim().toUpperCase());

  if (parts.length !== 2) {
    return null;
  }

  return {
    inputToken: parts[0],
    outputToken: parts[1],
  };
}

function extractWallet(message: string): string | null {
  const match = message.match(
    /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/,
  );

  return match?.[0] ?? null;
}

function isTradeRequest(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("execute") ||
    normalized.includes("execute trade") ||
    normalized.includes("execute swap") ||
    normalized.includes("perform swap") ||
    normalized.includes("perform trade") ||
    normalized.includes("make the swap") ||
    normalized.includes("make the trade") ||
    normalized.includes("swap now") ||
    normalized.includes("trade now") ||
    normalized.includes("buy") ||
    normalized.includes("sell")
  );
}

export async function routeAgentMessage(
  message: string,
): Promise<AgentResponse> {
  const normalized = message.toLowerCase().trim();

  /*
   * ---------------------------------------------------------
   * Chain health
   * ---------------------------------------------------------
   */

  if (
    normalized.includes("chain") &&
    (
      normalized.includes("health") ||
      normalized.includes("status") ||
      normalized.includes("operational")
    )
  ) {
    const response = await callMcpTool("chain_health");

    return {
      tool: "chain_health",
      response,
    };
  }

  /*
   * ---------------------------------------------------------
   * Staking
   * ---------------------------------------------------------
   */

  if (
    normalized.includes("staking") ||
    normalized.includes("stake") ||
    normalized.includes("validator")
  ) {
    const response = await callMcpTool("stake_info");

    return {
      tool: "stake_info",
      response,
    };
  }

  /*
   * ---------------------------------------------------------
   * Balance
   * ---------------------------------------------------------
   */

  if (
    normalized.includes("balance") ||
    normalized.includes("how much cook") ||
    normalized.includes("wallet balance")
  ) {
    const wallet = extractWallet(message);

    if (!wallet) {
      return {
        tool: null,
        response:
          "Please provide a wallet address so I can check its balance.",
      };
    }

    const response = await callMcpTool("get_balance", {
      wallet,
    });

    return {
      tool: "get_balance",
      args: {
        wallet,
      },
      response,
    };
  }

  /*
   * ---------------------------------------------------------
   * SWAP / TRADE
   * ---------------------------------------------------------
   *
   * Supports:
   *
   * Quote:
   * "Give me a quote for a $10 COOK to USDC swap"
   *
   * Execute:
   * "Execute a $10 COOK to USDC swap"
   *
   * "Swap $10 COOK to USDC now"
   *
   * IMPORTANT:
   * Trade execution calls the real MCP "trade" tool.
   */

  if (
    normalized.includes("swap") ||
    normalized.includes("trade")
  ) {
    const amount = extractAmount(message);

    if (!amount) {
      return {
        tool: null,
        response:
          "Tell me the swap amount, for example: Execute a $10 COOK to USDC swap.",
      };
    }

    const pair = extractSwapPair(message);

    if (!pair) {
      return {
        tool: null,
        response:
          "Please specify the token pair, for example: Execute a $10 COOK to USDC swap.",
      };
    }

    /*
     * -------------------------------------------------------
     * COOK -> USDC
     * -------------------------------------------------------
     *
     * Uses Solana/Jupiter.
     */

    if (
      (
        pair.inputToken === "COOK" ||
        pair.inputToken === "COOKIE"
      ) &&
      pair.outputToken === "USDC"
    ) {
      const inputMint = SOLANA_COOK_MINT;
      const outputMint = SOLANA_USDC_MINT;

      /*
       * Quote only
       */

      if (!isTradeRequest(message)) {
        const args = {
          inputMint,
          outputMint,
          amount,
          chain: "solana",
        };

        const response = await callMcpTool(
          "get_quote",
          args,
        );

        return {
          tool: "get_quote",
          args,
          response,
        };
      }

      /*
       * Real trade execution
       */

      const args = {
        inputMint,
        outputMint,
        amount,
        chain: "solana",
      };

      const response = await callMcpTool(
        "trade",
        args,
      );

      return {
        tool: "trade",
        args,
        response,
      };
    }

    /*
     * -------------------------------------------------------
     * USDC -> COOK
     * -------------------------------------------------------
     *
     * Uses Solana/Jupiter.
     */

    if (
      pair.inputToken === "USDC" &&
      (
        pair.outputToken === "COOK" ||
        pair.outputToken === "COOKIE"
      )
    ) {
      const inputMint = SOLANA_USDC_MINT;
      const outputMint = SOLANA_COOK_MINT;

      /*
       * Quote only
       */

      if (!isTradeRequest(message)) {
        const args = {
          inputMint,
          outputMint,
          amount,
          chain: "solana",
        };

        const response = await callMcpTool(
          "get_quote",
          args,
        );

        return {
          tool: "get_quote",
          args,
          response,
        };
      }

      /*
       * Real trade execution
       */

      const args = {
        inputMint,
        outputMint,
        amount,
        chain: "solana",
      };

      const response = await callMcpTool(
        "trade",
        args,
      );

      return {
        tool: "trade",
        args,
        response,
      };
    }

    /*
     * -------------------------------------------------------
     * COOK -> COOK
     * -------------------------------------------------------
     */

    if (
      (
        pair.inputToken === "COOK" ||
        pair.inputToken === "COOKIE"
      ) &&
      (
        pair.outputToken === "COOK" ||
        pair.outputToken === "COOKIE"
      )
    ) {
      return {
        tool: null,
        response:
          "COOK to COOK is not a valid swap pair.",
      };
    }

    /*
     * -------------------------------------------------------
     * Unsupported pair
     * -------------------------------------------------------
     */

    return {
      tool: null,
      response: {
        message:
          `I understand the ${pair.inputToken} to ${pair.outputToken} swap, but I don't have a known mint mapping for that pair yet.`,
        supportedExample:
          `Try: "Execute a $${amount} COOK to USDC swap"`,
      },
    };
  }

  /*
   * ---------------------------------------------------------
   * NFT marketplace
   * ---------------------------------------------------------
   */

  if (
    normalized.includes("nft") &&
    (
      normalized.includes("listing") ||
      normalized.includes("listings") ||
      normalized.includes("market")
    )
  ) {
    const args = {
      sort: "price",
      limit: 20,
    };

    const response = await callMcpTool(
      "get_nft_listings",
      args,
    );

    return {
      tool: "get_nft_listings",
      args,
      response,
    };
  }

  /*
   * ---------------------------------------------------------
   * NFT market stats
   * ---------------------------------------------------------
   */

  if (
    normalized.includes("nft") &&
    (
      normalized.includes("stats") ||
      normalized.includes("volume") ||
      normalized.includes("floor")
    )
  ) {
    const response = await callMcpTool(
      "get_nft_market_stats",
    );

    return {
      tool: "get_nft_market_stats",
      response,
    };
  }

  /*
   * ---------------------------------------------------------
   * .cook domain lookup
   * ---------------------------------------------------------
   */

  if (
    normalized.includes(".cook") ||
    normalized.includes("domain")
  ) {
    const match = message.match(
      /\b([a-zA-Z0-9-]+(?:\.cook)?)\b/,
    );

    if (match) {
      const name = match[1];

      const response = await callMcpTool(
        "resolve_domain",
        {
          name,
        },
      );

      return {
        tool: "resolve_domain",
        args: {
          name,
        },
        response,
      };
    }
  }

  /*
   * ---------------------------------------------------------
   * Fallback
   * ---------------------------------------------------------
   */

  return {
    tool: null,
    response:
      "I couldn't determine which Cookie Chain action you want. Try asking about chain health, staking, wallet balance, a swap quote, executing a swap, NFTs, or .cook domains.",
  };
}