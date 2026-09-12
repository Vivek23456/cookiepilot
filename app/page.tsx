
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bot,
  ChevronRight,
  CircleDollarSign,
  Command,
  Cpu,
  Loader2,
  Network,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

const API_URL = "http://localhost:3001";

type ChainHealth = {
  healthy: boolean;
  status: string;
  epoch: number;
  epochProgressPct: number;
  validatorCount: number;
  delinquentCount: number;
  slotsPerSec: number;
  blockHeight: number;
  rpc: {
    latencyMs: number;
  };
};

type ChatResult = {
  message: string;
  result?: {
    content?: {
      type: string;
      text: string;
    }[];
  };
};

export default function Home() {
  const [health, setHealth] = useState<ChainHealth | null>(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadHealth() {
    try {
      const res = await fetch(`${API_URL}/api/chain-health`);
      const data = await res.json();

      const parsed = JSON.parse(data.content?.[0]?.text ?? "{}");
      setHealth(parsed);
    } catch {
      setHealth(null);
    }
  }

  async function sendCommand() {
    if (!message.trim() || loading) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data: ChatResult = await res.json();

      setResponse(data.result?.content?.[0]?.text ?? "No response received.");
    } catch {
      setResponse("Unable to reach CookiePilot API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();

    const interval = setInterval(loadHealth, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <Bot size={22} />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                CookiePilot
              </h1>
              <p className="text-xs text-white/40">
                Autonomous Cookie Chain agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            MCP Connected
          </div>
        </header>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            {/* Hero */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                Command Center
              </p>

              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Tell CookiePilot
                <span className="text-white/35"> what to do.</span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                Query the Cookie Chain, inspect markets, analyze opportunities,
                and execute supported on-chain actions through MCP.
              </p>
            </div>

            {/* Command box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Command size={17} />
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendCommand();
                    }
                  }}
                  placeholder="Ask CookiePilot about the chain, staking, balances, pools, or swaps..."
                  className="min-h-[110px] flex-1 resize-none bg-transparent pt-1 text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs text-white/25">
                  Enter to execute · Shift + Enter for newline
                </span>

                <button
                  onClick={sendCommand}
                  disabled={!message.trim() || loading}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Thinking
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Execute
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick commands */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Network,
                  title: "Chain health",
                  text: "Is the Cookie Chain healthy?",
                },
                {
                  icon: Zap,
                  title: "Staking",
                  text: "Show me staking information",
                },
                {
                  icon: CircleDollarSign,
                  title: "Trading",
                  text: "Give me a quote for a $10 swap",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={() => setMessage(item.text)}
                    className="group rounded-xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <Icon size={17} className="mb-3 text-white/50" />

                    <p className="text-xs font-medium text-white/80">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      {item.text}
                    </p>

                    <ChevronRight
                      size={14}
                      className="mt-3 text-white/20 transition group-hover:translate-x-1"
                    />
                  </button>
                );
              })}
            </div>

            {/* Agent response */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={15} className="text-white/50" />
                <span className="text-xs font-medium uppercase tracking-widest text-white/35">
                  Agent Output
                </span>
              </div>

              <div className="min-h-[180px] rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                {loading ? (
                  <div className="flex items-center gap-3 text-sm text-white/40">
                    <Loader2 size={16} className="animate-spin" />
                    CookiePilot is executing the request...
                  </div>
                ) : response ? (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-white/65">
                    {response}
                  </pre>
                ) : (
                  <div className="flex h-[140px] items-center justify-center text-sm text-white/20">
                    Agent responses will appear here.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="space-y-4">
            {/* Chain status */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-white/50" />
                  <span className="text-sm font-medium">Chain Status</span>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                    health?.healthy
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-red-400/10 text-red-300"
                  }`}
                >
                  {health?.healthy ? "OPERATIONAL" : "OFFLINE"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Epoch"
                  value={health ? String(health.epoch) : "—"}
                />

                <Metric
                  label="Progress"
                  value={
                    health ? `${health.epochProgressPct.toFixed(1)}%` : "—"
                  }
                />

                <Metric
                  label="Validators"
                  value={health ? String(health.validatorCount) : "—"}
                />

                <Metric
                  label="Delinquent"
                  value={health ? String(health.delinquentCount) : "—"}
                />

                <Metric
                  label="Block height"
                  value={health ? health.blockHeight.toLocaleString() : "—"}
                />

                <Metric
                  label="RPC latency"
                  value={health ? `${health.rpc.latencyMs} ms` : "—"}
                />
              </div>
            </div>

            {/* Agent status */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-5 flex items-center gap-2">
                <Cpu size={16} className="text-white/50" />
                <span className="text-sm font-medium">Agent Runtime</span>
              </div>

              <StatusRow
                icon={<ShieldCheck size={15} />}
                label="MCP transport"
                value="Connected"
              />

              <StatusRow
                icon={<Network size={15} />}
                label="Cookie Chain"
                value="Operational"
              />

              <StatusRow
                icon={<Activity size={15} />}
                label="Tool execution"
                value="Ready"
              />
            </div>

            {/* Wallet */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Wallet size={16} className="text-white/50" />
                <span className="text-sm font-medium">Wallet</span>
              </div>

              <p className="text-xs text-white/25">
                Connect a wallet to enable balance queries and transaction
                execution.
              </p>

              <button className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/5">
                Connect Wallet
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wider text-white/25">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white/75">{value}</p>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/5 py-3 first:border-t-0">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <span className="text-xs text-emerald-300">{value}</span>
    </div>
  );
}
