import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

console.log("Connecting to server at: " + SERVER_URL);

const socket = io(SERVER_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
