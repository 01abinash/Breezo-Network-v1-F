// src/services/node.service.js
import * as nodeApi from "../api/node.api";

export const fetchDashboard = async () => {
  const res = await nodeApi.getDashboard();
  return res.data.data;
};
