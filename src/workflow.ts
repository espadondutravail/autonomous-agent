import { SapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { runTextGeneration, runVisionAnalysis, runTranslation } from "./aceDataCloud";

export async function runWorkflow(client: SapClient) {
  console.log("-------------------------------------------------");
  console.log("Starting Autonomous Workflow Loop...");
  
  // 1. Tool Discovery via SAP
  console.log("[SAP] Discovering tools for capability 'acedata:completion'...");
  try {
    const agents = await client.registry.findAgentsByCapability("acedata:completion");
    console.log(`[SAP] Found ${agents.length} agents offering acedata:completion.`);
  } catch (error) {
    console.log("[SAP] Warning: Tool discovery failed or no agents found yet.");
  }

  // 2. Execution & Payment Settlement via Ace Data Cloud (x402)
  console.log("[Execution] Running tasks...");

  // Task A: Text Generation
  const textResponse = await runTextGeneration("Explain the concept of an on-chain autonomous agent in 2 sentences.");
  if (textResponse) {
    console.log("[Result] Text Generation successful.");
  }

  // Task B: Vision Analysis
  const visionResponse = await runVisionAnalysis("https://example.com/sample-image.jpg");
  if (visionResponse) {
    console.log("[Result] Vision Analysis successful.");
  }

  // Task C: Translation
  const translationResponse = await runTranslation("Hello, this agent is running autonomously and settling payments.", "fr");
  if (translationResponse) {
    console.log("[Result] Translation successful.");
  }

  console.log("Workflow Loop Completed.");
  console.log("-------------------------------------------------");
}
