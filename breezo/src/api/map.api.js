import { api } from "./axios";

export const getMapNodes = () => api.get("/map/nodes");
