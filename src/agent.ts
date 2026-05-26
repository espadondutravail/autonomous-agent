import { SapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

export async function initAgent() {
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is required in .env");
  }

  // Parse keypair from base58 or JSON array
  let keypair: Keypair;
  try {
    if (privateKey.startsWith("[")) {
      keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKey)));
    } else {
      keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    }
  } catch (err) {
    throw new Error("Failed to parse SOLANA_PRIVATE_KEY. Ensure it is a valid base58 string or JSON array.");
  }

  const rpcUrl = process.env.SYNAPSE_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new Wallet(keypair);
  
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  const client = SapClient.from(provider);

  console.log(`Agent Wallet Address: ${wallet.publicKey.toBase58()}`);

  // Register the agent on SAP if it hasn't been registered yet
  try {
    console.log("Registering Agent on Synapse Agent Protocol...");
    await client.agent.register({
      name: "AceDataWorker",
      description: "Autonomous Agent executing Ace Data Cloud AI tasks via x402 payments",
      capabilities: [
        {
          id: "acedata:completion",
          protocolId: "acedata",
          version: "1.0",
          description: "Generates text completions using AI",
        },
        {
          id: "acedata:vision",
          protocolId: "acedata",
          version: "1.0",
          description: "Analyzes images using AI vision models",
        },
        {
          id: "acedata:translate",
          protocolId: "acedata",
          version: "1.0",
          description: "Translates text using AI",
        }
      ],
      pricing: [], // Optional: add pricing if this agent charges for services
      protocols: ["acedata", "A2A"],
    });
    console.log("Agent successfully registered!");
  } catch (error: any) {
    // If it's already registered, it might throw an error or we can check first.
    if (error.message && error.message.includes("already in use")) {
      console.log("Agent is already registered on SAP.");
    } else {
      console.error("Error during agent registration:", error);
    }
  }

  return { client, wallet };
}
