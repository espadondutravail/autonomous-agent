import { initAgent } from "./agent";
import { runWorkflow } from "./workflow";

// Run workflow every 5 minutes (300,000 ms)
const WORKFLOW_INTERVAL_MS = 300000;

async function main() {
  console.log("Starting Autonomous Agent...");
  
  try {
    const { client } = await initAgent();

    // Run immediately once
    await runWorkflow(client);

    // Schedule the recurring loop
    console.log(`Scheduling workflow loop every ${WORKFLOW_INTERVAL_MS / 1000} seconds...`);
    setInterval(async () => {
      try {
        await runWorkflow(client);
      } catch (err) {
        console.error("Error in workflow loop:", err);
      }
    }, WORKFLOW_INTERVAL_MS);

  } catch (error) {
    console.error("Failed to initialize agent:", error);
    process.exit(1);
  }
}

main();
