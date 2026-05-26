import { SapConnection, SapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { Keypair } from "@solana/web3.js";
import { loadKeypair } from "./wallet";
import { config } from "./config";

export interface AgentContext {
  client: SapClient;
  keypair: Keypair;
}

/**
 * Initialise the SAP agent:
 *  1. Load keypair from env
 *  2. Create SapClient via SapConnection.fromKeypair (correct SDK API)
 *  3. Register agent on SAP mainnet (idempotent)
 */
export async function initAgent(): Promise<AgentContext> {
  const keypair = loadKeypair(config.solanaPrivateKey);
  console.log(`🔑 Agent wallet: ${keypair.publicKey.toBase58()}`);

  // SapConnection.fromKeypair is the correct factory — compatible with
  // synapse-client-sdk and the OOBE Protocol RPC.
  const { client } = SapConnection.fromKeypair(config.synapseRpcUrl, keypair);

  // Register (idempotent — safe to call every startup)
  try {
    console.log("📡 Registering agent on Synapse Agent Protocol (mainnet)…");
    await client.agent.register({
      name: "AceDataWorker-v2",
      description:
        "Autonomous AI agent that discovers tools via SAP, executes tasks " +
        "using Ace Data Cloud services, and settles payments with x402 on Solana.",
      capabilities: [
        {
          id: "acedata:chat",
          protocolId: "acedata",
          version: "2.0",
          description: "AI chat completions via x402 payment",
        },
        {
          id: "acedata:image",
          protocolId: "acedata",
          version: "2.0",
          description: "AI image generation via x402 payment",
        },
        {
          id: "acedata:audio",
          protocolId: "acedata",
          version: "2.0",
          description: "AI text-to-speech audio generation via x402 payment",
        },
      ],
      pricing: [], // consuming agent — no price charged for incoming calls
      protocols: ["acedata", "x402", "A2A"],
    });
    console.log("✅ Agent registered on SAP!");
  } catch (err: any) {
    // "already in use" is expected on every restart after first run
    if (
      err?.message?.toLowerCase().includes("already") ||
      err?.message?.toLowerCase().includes("in use") ||
      err?.message?.toLowerCase().includes("exists")
    ) {
      console.log("ℹ️  Agent already registered — skipping.");
    } else {
      console.warn("⚠️  Registration warning (non-fatal):", err?.message);
    }
  }

  return { client, keypair };
}
