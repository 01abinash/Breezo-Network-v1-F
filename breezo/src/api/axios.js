import axios from "axios";
import { TOKEN_SESSION_KEY } from "../lib/tokenization";

export const api = axios.create({
  baseURL: "http://34.132.6.170:5000/api/v1",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(TOKEN_SESSION_KEY);
  const session = raw ? JSON.parse(raw) : null;

  const token = session?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
