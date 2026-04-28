import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";


import bs58 from "bs58";

// ── CONFIG ──
const PROGRAM_ID    = new PublicKey("2CZ1WzjHhgbBFaRaTxhLpdKQKAEsYDFga6bbuQRHfCJu");
const BREEZO_MINT   = new PublicKey("soQUnxjoEMCMxBroyS4AvrtVn2JCtPZnR3N53NA5AvU");
const RPC           = clusterApiUrl("devnet"); // change to mainnet if needed

// Load your admin/backend keypair (the one that has SOL to pay for account creation)
// const rawKey = JSON.parse(fs.readFileSync("./keypair.json", "utf-8"));

const secretKey = bs58.decode("2Hgx3UD8G2jpR64WictoQusgu2k528xrh2wftEWe3MCBqbGXFAvh8JJCSsspse7oSDK5THPs3rAt4eX1jrUN7o1Y");

// create keypair
const payer = Keypair.fromSecretKey(secretKey);

const connection = new Connection(RPC, "confirmed");

const getTreasuryPDA = () =>
  PublicKey.findProgramAddressSync([Buffer.from("treasury")], PROGRAM_ID)[0];

async function main() {
  const treasuryAuthority = getTreasuryPDA();
  console.log("Treasury PDA:", treasuryAuthority.toBase58());

  const treasuryATA = await getAssociatedTokenAddress(
    BREEZO_MINT,
    treasuryAuthority,
    true // allowOwnerOffCurve — required for PDA owners
  );
  console.log("Treasury ATA:", treasuryATA.toBase58());

  // Check if already initialized
  const existing = await connection.getAccountInfo(treasuryATA);
  if (existing) {
    console.log(" Treasury ATA already exists — nothing to do.");
    return;
  }

  // Create the ATA
  const ix = createAssociatedTokenAccountInstruction(
    payer.publicKey,      // payer (pays rent)
    treasuryATA,          // ATA address to create
    treasuryAuthority,    // owner of the ATA (the PDA)
    BREEZO_MINT,          // mint
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new (await import("@solana/web3.js")).Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer.publicKey;
  tx.add(ix);
  tx.sign(payer);

  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig, "confirmed");

  console.log("✅ Treasury ATA created! Tx:", sig);
  console.log("Now fund it with BREEZO tokens so users can claim.");
}

main().catch(console.error);
