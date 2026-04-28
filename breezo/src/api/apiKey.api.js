import { api } from "./axios";

// =========================
// API KEYS
// =========================
export async function getApiKeyDashboard(token) {
  const res = await api.get("/api-keys", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

export async function createOperatorApiKey(token, body) {
  const res = await api.post("/api-keys", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    generatedKey: res.data.data.key,
    dashboard: await getApiKeyDashboard(token),
  };
}

export async function deleteOperatorApiKey(token, id) {
  const res = await api.delete(`/api-keys/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}
export const deactivateOperatorApiKey = async (token, id) => {
  // Replace with your actual endpoint path
  const response = await fetch(`/api/keys/${id}/deactivate`, {
    method: "PATCH", // Or "PUT", depending on your router setup
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Deactivation failed");
  }
  return response.json();
};

// =========================
// PURCHASE CREDITS
// =========================
export async function purchaseApiKeyCredits(token, amount) {
  const res = await api.post("/api-keys/purchase", amount, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}
export async function purchaseCredits(token, payload) {
  const res = await api.post("/credit/add", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}
