import { initAgent } from "./agent";
import { runWorkflowLoop } from "./workflow";
import { config } from "./config";

async function main() {
  console.log("🚀 Initializing Autonomous Agent...");
  
  try {
    const { client, keypair } = await initAgent();

    // Run the workflow immediately
    await runWorkflowLoop(client, keypair);

    // Schedule the recurring loop
    console.log(`\n⏳ Scheduling workflow loop every ${config.workflowIntervalMs / 1000} seconds...`);
    setInterval(async () => {
      try {
        await runWorkflowLoop(client, keypair);
      } catch (err: any) {
        console.error("❌ Unhandled error in workflow loop:", err?.message);
      }
    }, config.workflowIntervalMs);

  } catch (error: any) {
    console.error("💥 Fatal initialization error:", error?.message);
    process.exit(1);
  }
}

main();
