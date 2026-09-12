import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  name: "cookiepilot",
  version: "0.1.0",
});

let connected = false;

export async function getMcpClient() {
  if (connected) {
    return client;
  }

  const transport = new StdioClientTransport({
    command: "yarn",
    args: ["mcp"],
    cwd: "/home/vivek/Projects/cookie-mcp",
    env: {
      ...process.env,
      COOKIE_PRIVATE_KEY: process.env.COOKIE_PRIVATE_KEY ?? "",
    },
  });

  await client.connect(transport);

  connected = true;

  console.log("CookiePilot connected to cookie-mcp");

  return client;
}

export async function listMcpTools() {
  const mcp = await getMcpClient();
  return mcp.listTools();
}

export async function callMcpTool(
  name: string,
  args: Record<string, unknown> = {},
) {
  const mcp = await getMcpClient();

  const result = await mcp.callTool({
    name,
    arguments: args,
  });

  return result;
}

