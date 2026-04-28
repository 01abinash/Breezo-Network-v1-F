import { useEffect } from "react";
import { socket } from "../sockets/socket.client";
import { SOCKET_EVENTS } from "../sockets/socket.events";

export const useDashboardSocket = (setDashboard) => {
  useEffect(() => {
    socket.connect();

    socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, (data) => {
      setDashboard(data);
    });

    return () => {
      socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE);
    };
  }, []);
};
