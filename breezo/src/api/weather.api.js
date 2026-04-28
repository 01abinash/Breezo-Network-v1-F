import { api } from "./axios";

export async function getCurrentWeather(apiKey, nodeId) {
  const res = await api.get("/weather/current", {
    headers: {
      "x-api-key": apiKey,
    },
    params: { nodeId },
  });

  return res.data.data;
}

export async function getNearbyWeather(apiKey, lat, lng) {
  const res = await api.get("/weather/nearby", {
    headers: {
      "x-api-key": apiKey,
    },
    params: { lat, lng },
  });

  return res.data.data;
}

export async function getWeatherHistory(apiKey, nodeId, from, to) {
  const res = await api.get("/weather/history", {
    headers: {
      "x-api-key": apiKey,
    },
    params: { nodeId, from, to },
  });

  return res.data.data;
}
