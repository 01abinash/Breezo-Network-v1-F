import { api } from "./axios";

export async function getApiUsage(token) {
  const res = await api.get("/usage", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}
