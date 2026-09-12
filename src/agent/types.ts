export type AgentResponse = {
  tool: string | null;
  args?: Record<string, unknown>;
  response: unknown;
};
