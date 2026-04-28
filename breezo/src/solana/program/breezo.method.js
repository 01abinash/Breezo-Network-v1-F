import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import BN from "bn.js";

// =====================================================
// CONFIG
// =====================================================
const PROGRAM_ID = new PublicKey(
  "2CZ1WzjHhgbBFaRaTxhLpdKQKAEsYDFga6bbuQRHfCJu"
);

const BREEZO_MINT = new PublicKey(
  "soQUnxjoEMCMxBroyS4AvrtVn2JCtPZnR3N53NA5AvU"
);

// CONFIRMED: decimals = 9
const BREEZO_DECIMALS = 9;
const BREEZO_FACTOR = 10n ** BigInt(BREEZO_DECIMALS);

// =====================================================
// TOKEN UTILS (SAFE)
// =====================================================

// RAW → HUMAN
export const fromBaseUnits = (raw) => {
  return Number(raw) / Number(BREEZO_FACTOR);
};

// HUMAN → RAW
export const toBaseUnits = (amount) => {
  return BigInt(Math.round(amount * Number(BREEZO_FACTOR)));
};

// =====================================================
// PDA HELPERS
// =====================================================

// Treasury PDA
export const getTreasuryPDA = () =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    PROGRAM_ID
  )[0];

// Node PDA
export const getNodePDA = (ownerPubkey, devicePubkey) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("node"),
      ownerPubkey.toBuffer(),
      devicePubkey.toBuffer(),
    ],
    PROGRAM_ID
  )[0];

// =====================================================
// FETCH ON-CHAIN REWARD
// =====================================================

export const getNodeRewardBalance = async (
  program,
  nodeAccountAddress
) => {
  try {
    const acc = await program.account.nodeAccount.fetch(
      new PublicKey(nodeAccountAddress)
    );

    const raw = BigInt(acc.rewardBalance.toString());

    console.log("[breezo] RAW:", raw.toString());

    const human = fromBaseUnits(raw);

    console.log("[breezo] HUMAN:", human);

    return human;
  } catch (err) {
    console.error("[breezo] fetch error:", err);
    return 0;
  }
};

// =====================================================
// CLAIM REWARD
// =====================================================

export const claimReward = async (
  program,
  nodeAccountAddress,
  ownerPublicKey
) => {
  const nodeAccountPubkey = new PublicKey(nodeAccountAddress);
  const treasuryAuthority = getTreasuryPDA();

  // Fetch on-chain reward
  const acc = await program.account.nodeAccount.fetch(nodeAccountPubkey);
  const raw = BigInt(acc.rewardBalance.toString());

  if (raw === 0n) {
    throw new Error("No rewards to claim on-chain.");
  }

  const amount = new BN(raw.toString());

  console.log("[breezo] Claim RAW:", raw.toString());

  // ATAs
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    BREEZO_MINT,
    treasuryAuthority,
    true
  );

  const userTokenAccount = await getAssociatedTokenAddress(
    BREEZO_MINT,
    ownerPublicKey
  );

  console.log("[breezo] treasuryTokenAccount:", treasuryTokenAccount.toBase58());
  console.log("[breezo] userTokenAccount:", userTokenAccount.toBase58());

  // 🚀 FINAL TX (FIXED ACCOUNTS)
  return await program.methods
    .claimReward(amount)
    .accounts({
      nodeAccount: nodeAccountPubkey,
      owner: ownerPublicKey,

      mint: BREEZO_MINT,

      treasuryTokenAccount,
      userTokenAccount,

      // ⚠️ IMPORTANT: only keep this if your Rust program expects it
      treasuryAuthority,

      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
};

