import { useEffect } from "react";
import { socket } from "../sockets/socket.client";
import { SOCKET_EVENTS } from "../sockets/socket.events";

export const useMapSocket = (setNodes) => {
  useEffect(() => {
    socket.connect();

    socket.on(SOCKET_EVENTS.NODE_UPDATE, (data) => {
      setNodes((prev) => {
        const map = { ...prev };

        map[data.nodeId] = data; // normalized update

        return map;
      });
    });

    return () => {
      socket.off(SOCKET_EVENTS.NODE_UPDATE);
    };
  }, []);
};
