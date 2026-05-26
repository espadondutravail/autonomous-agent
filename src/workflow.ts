import { SapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { initAceClient, runChatCompletion, runImageGeneration, runTextToSpeech, getStats } from "./aceClient";
import { openSentinelEscrow, callSentinel } from "./sentinel";
import { Keypair } from "@solana/web3.js";
import { config } from "./config";

/**
 * The main autonomous workflow loop.
 * Fulfils all requirements for the "Ace Data Cloud Usage" AND "General Payment Volume" categories.
 */
export async function runWorkflowLoop(client: SapClient, keypair: Keypair) {
  console.log("\n=================================================");
  console.log("🔄 Starting Autonomous Workflow Cycle...");
  console.log(`⏱️  Next cycle in ${config.workflowIntervalMs / 1000}s`);
  console.log("=================================================");

  // 1. Initialize SDKs & Escrows (Idempotent)
  initAceClient(keypair);
  await openSentinelEscrow(client);

  // 2. Network Discovery (SAP)
  console.log("\n🔍 [Discovery] Finding tools on Synapse Agent Protocol...");
  try {
    const agents = await client.discovery.findAgentsByCapability("acedata:chat");
    console.log(`   → Found ${agents.length} agents supporting acedata:chat capability.`);
  } catch (err: any) {
    console.log("   → Warning: SAP discovery query failed:", err?.message);
  }

  // 3. Synapse Sentinel Interaction (General Payment Volume Requirement)
  console.log("\n🛡️  [Task 1/4] Interacting with Synapse Sentinel...");
  await callSentinel(client);

  // 4. AceDataCloud Execution (Ace Data Cloud Usage Requirement)
  // Must use 3 distinct services. All calls trigger x402 payments via the custom payment handler.
  console.log("\n⚡ [Task 2/4] AceDataCloud Service 1: Chat Completion");
  const chatPrompt = "In one short sentence, why are autonomous on-chain agents important?";
  await runChatCompletion(chatPrompt);

  console.log("\n⚡ [Task 3/4] AceDataCloud Service 2: Image Generation");
  const imagePrompt = "A futuristic robot paying with a digital coin, cyberpunk style, neon lights";
  await runImageGeneration(imagePrompt);

  console.log("\n⚡ [Task 4/4] AceDataCloud Service 3: Text-to-Speech");
  const ttsText = "Task complete. Payments settled autonomously.";
  await runTextToSpeech(ttsText);

  // 5. Report Stats
  const stats = getStats();
  console.log("\n📊 [Metrics] Cycle Complete!");
  console.log(`   → Total Paid API Calls: ${stats.callCount}`);
  console.log(`   → Last x402 TX Hash: ${stats.txHashes[stats.txHashes.length - 1] || "None"}`);
  console.log("=================================================\n");
}
