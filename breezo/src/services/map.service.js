import { getMapNodes } from "../api/map.api";

export const fetchMapNodes = async () => {
  const res = await getMapNodes();
  return res.data.data;
};
