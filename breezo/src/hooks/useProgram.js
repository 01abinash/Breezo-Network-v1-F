import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "../idl/breezo.json";

const PROGRAM_ID = "2CZ1WzjHhgbBFaRaTxhLpdKQKAEsYDFga6bbuQRHfCJu";

export const useProgram = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: "confirmed" }
    );

    return new Program(idl, PROGRAM_ID, provider);
  }, [wallet, connection]);
};
