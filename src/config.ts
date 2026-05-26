import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
}

export const config = {
  solanaPrivateKey: required("SOLANA_PRIVATE_KEY"),
  synapseRpcUrl:
    process.env.SYNAPSE_RPC_URL ||
    "https://api.mainnet-beta.solana.com",
  // How often to run the workflow (default 2 min — more volume = better rank)
  workflowIntervalMs: parseInt(
    process.env.WORKFLOW_INTERVAL_MS || "120000"
  ),
  // Synapse Sentinel agent wallet (fixed address from bounty page)
  sentinelWallet:
    process.env.SENTINEL_WALLET ||
    "Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph",
  // Optional: Sentinel HTTP endpoint for x402 calls
  sentinelEndpoint:
    process.env.SENTINEL_ENDPOINT ||
    "https://sentinel.oobeprotocol.ai/x402",
};
