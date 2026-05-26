import {
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Load a Solana Keypair from a base58 string or a JSON array string.
 */
export function loadKeypair(privateKey: string): Keypair {
  try {
    if (privateKey.trim().startsWith("[")) {
      return Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(privateKey.trim()))
      );
    }
    return Keypair.fromSecretKey(bs58.decode(privateKey.trim()));
  } catch {
    throw new Error(
      "Invalid SOLANA_PRIVATE_KEY. Must be a base58 string or JSON byte-array."
    );
  }
}

/**
 * Minimal wallet adapter compatible with @acedatacloud/x402-client Solana handler.
 * Implements signTransaction / signAllTransactions using the server keypair.
 */
export function createWalletAdapter(keypair: Keypair) {
  return {
    publicKey: keypair.publicKey,

    async signTransaction<T extends Transaction | VersionedTransaction>(
      tx: T
    ): Promise<T> {
      if (tx instanceof Transaction) {
        tx.sign(keypair);
      } else {
        // VersionedTransaction
        (tx as VersionedTransaction).sign([keypair]);
      }
      return tx;
    },

    async signAllTransactions<T extends Transaction | VersionedTransaction>(
      txs: T[]
    ): Promise<T[]> {
      return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    },

    async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
      tx: T
    ): Promise<{ signature: string }> {
      throw new Error("signAndSendTransaction is not implemented. Use signTransaction instead.");
    },
  };
}
