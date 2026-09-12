import express from "express";
import cors from "cors";
import { callMcpTool, listMcpTools } from "./mcp-client.js";
import { routeAgentMessage } from "./agent/router.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "cookiepilot-api",
  });
});

app.get("/api/tools", async (_req, res) => {
  try {
    const tools = await listMcpTools();

    res.json(tools);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to connect to cookie-mcp",
    });
  }
});

app.get("/api/chain-health", async (_req, res) => {
  try {
    const result = await callMcpTool("chain_health");

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to query Cookie Chain",
    });
  }
});

app.get("/api/stake-info", async (_req, res) => {
  try {
    const result = await callMcpTool("stake_info");

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to query staking information",
    });
  }
});

app.get("/api/balance/:wallet", async (req, res) => {
  try {
    const result = await callMcpTool("get_balance", {
      wallet: req.params.wallet,
    });

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to query wallet balance",
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const result = await routeAgentMessage(message);

    res.json({
      message,
      result,
    });
  } catch (error) {
    console.error("Agent error:", error);

    res.status(500).json({
      error: "CookiePilot failed to execute the request",
    });
  }
});

app.listen(3001, () => {
  console.log("CookiePilot API running on http://localhost:3001");
});