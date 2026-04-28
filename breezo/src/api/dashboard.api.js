import { api } from "./axios";

export const dashboard = async (wallet) => {
  const res = await api.post("/node/dashboard", {
    wallet,
  });

  return res.data.data;
};
