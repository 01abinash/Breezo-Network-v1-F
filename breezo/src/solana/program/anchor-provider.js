import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "../../idl/breezo.json";

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet?.publicKey) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: "confirmed" }
    );

    return new Program(idl, provider);
  }, [connection, wallet]);

  return program;
};
