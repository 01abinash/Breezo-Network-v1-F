import { io } from "socket.io-client";

// 🔗 Backend URL (use env in real project)
const SOCKET_URL = import.meta.env.VITE_API_URL || "https://api.cka.one";

// 🚀 Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false, // we control when to connect

  transports: ["websocket"], // force websocket (better for realtime)

  withCredentials: true, // if using cookies / auth

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// 🔐 Optional: attach token before connecting
export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (token) {
    socket.auth = { token };
  }

  socket.connect();
};

// 🔌 Disconnect helper
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
