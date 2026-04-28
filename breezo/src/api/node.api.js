// src/api/node.api.js
import { api } from "./axios";

export const getDashboard = () => api.get("/node/dashboard");
export const createNode = (data) => api.post("/node/create", data);
export const claimReward = () => api.post("/node/reward/claim");
