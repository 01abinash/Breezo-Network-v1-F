import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "../../idl/breezo.json";
import { PublicKey } from "@solana/web3.js";
export const getProgram = (connection, wallet) => {
  if (!wallet?.publicKey) return null;

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return new Program(idl,  new PublicKey(idl.metadata.address) , provider);
};
