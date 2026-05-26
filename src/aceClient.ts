/**
 * aceClient.ts
 * Wraps the @acedatacloud/sdk with the x402/Solana payment handler.
 * Exposes 3 distinct AceDataCloud services required by the bounty:
 *   1. Chat completions   (openai-compatible)
 *   2. Image generation
 *   3. Audio / TTS generation
 */

import { AceDataCloud } from "@acedatacloud/sdk";
import { createX402PaymentHandler } from "@acedatacloud/x402-client";
import { Keypair } from "@solana/web3.js";
import { createWalletAdapter } from "./wallet";

// ─── Telemetry ────────────────────────────────────────────────────────────────
let _callCount = 0;
let _txHashes: string[] = [];

export function getStats() {
  return { callCount: _callCount, txHashes: _txHashes };
}

function recordCall(txHash?: string) {
  _callCount++;
  if (txHash) _txHashes.push(txHash);
}

// ─── Client singleton ─────────────────────────────────────────────────────────
let _aceClient: AceDataCloud | null = null;

export function initAceClient(keypair: Keypair): AceDataCloud {
  const walletAdapter = createWalletAdapter(keypair);

  _aceClient = new AceDataCloud({
    // No apiToken — every request triggers a real x402 402→pay→retry cycle
    // @ts-ignore: version mismatch between @acedatacloud/sdk and x402-client types
    paymentHandler: createX402PaymentHandler({
      network: "solana",
      solanaWallet: walletAdapter, // server keypair acting as wallet
    }),
  });

  console.log(
    "✅ AceDataCloud initialised — payments via x402/Solana (USDC)"
  );
  return _aceClient;
}

function ace(): AceDataCloud {
  if (!_aceClient)
    throw new Error("Call initAceClient() before using ace services.");
  return _aceClient;
}

// ─── Service 1: Chat completions ──────────────────────────────────────────────
export async function runChatCompletion(
  prompt: string,
  model = "gpt-4o-mini"
): Promise<string | null> {
  console.log(`💬 [Chat] "${prompt.slice(0, 60)}…"`);
  try {
    const res: any = await ace().openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    recordCall((res as any)._headers?.["x402-tx"]);
    const content = res.choices[0]?.message?.content ?? null;
    console.log(`   → "${content?.slice(0, 80)}"`);
    return content;
  } catch (err: any) {
    console.error("❌ [Chat] Error:", err?.message);
    return null;
  }
}

// ─── Service 2: Image generation ─────────────────────────────────────────────
export async function runImageGeneration(
  prompt: string
): Promise<string | null> {
  console.log(`🎨 [Image] "${prompt}"`);
  try {
    const task: any = await ace().images.generate({
      prompt,
      n: 1,
      size: "256x256",
    });
    const result = await task.wait(); // SDK handles polling
    recordCall();
    const url = result.data[0]?.url ?? null;
    console.log(`   → Image URL: ${url}`);
    return url;
  } catch (err: any) {
    console.error("❌ [Image] Error:", err?.message);
    return null;
  }
}

// ─── Service 3: Audio / TTS ───────────────────────────────────────────────────
export async function runTextToSpeech(text: string): Promise<boolean> {
  console.log(`🔊 [Audio/TTS] "${text.slice(0, 60)}…"`);
  try {
    const res = await (ace() as any).audio.speech.create({
      model: "tts-1",
      input: text,
      voice: "alloy",
    });
    recordCall();
    console.log(`   → Audio generated (${res?.headers?.["content-length"] ?? "??"} bytes)`);
    return true;
  } catch (err: any) {
    console.error("❌ [Audio] Error:", err?.message);
    return false;
  }
}
