import app from "./app.js";
import { Server } from "socket.io";
// const port = process.env.PORT || 5000;
import http from "http";
import SocketManager from "./services/socketManager.js";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const SocketManagerInstance = new SocketManager(io);

io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);
  SocketManagerInstance.handleConnection(socket);
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
