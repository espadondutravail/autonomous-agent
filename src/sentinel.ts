import { SapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { config } from "./config";

let _paymentCtx: any = null;

export async function openSentinelEscrow(client: SapClient): Promise<void> {
  if (_paymentCtx) return;

  try {
    console.log("🛡️  [Sentinel] Opening escrow…");
    const sentinelPk = new PublicKey(config.sentinelWallet);

    _paymentCtx = await client.x402.preparePayment(sentinelPk, {
      pricePerCall: 0, // Sentinel health check is usually free
      maxCalls: 50,
      deposit: 0,
    });

    console.log("✅ [Sentinel] Escrow opened successfully.");
  } catch (err: any) {
    console.warn("⚠️  [Sentinel] Escrow open failed (non-fatal):", err?.message);
  }
}

export async function callSentinel(client: SapClient): Promise<boolean> {
  console.log("🛡️  [Sentinel] Calling Synapse Sentinel agent…");

  if (config.sentinelEndpoint) {
    try {
      const headers = _paymentCtx ? client.x402.buildPaymentHeaders(_paymentCtx) : {};
      const res = await axios.post(
        config.sentinelEndpoint,
        {
          action: "health-check",
          ping: true,
          caller: "AceDataWorker-v2"
        },
        {
          headers,
          timeout: 10000,
        }
      );
      console.log("✅ [Sentinel] HTTP x402 call succeeded:", res.status);
      return true;
    } catch (err: any) {
      console.warn("⚠️  [Sentinel] HTTP call failed:", err?.message);
    }
  }

  return false;
}
