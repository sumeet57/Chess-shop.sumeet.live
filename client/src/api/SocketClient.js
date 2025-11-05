import { io } from "socket.io-client";

class SocketClient {
  constructor() {
    this.socket = null;
    this.SERVER_URL = "http://localhost:5000";
    this.eventHandlers = {};
    this.currentRoomId = null;
  }

  on(event, handler) {
    this.eventHandlers[event] = handler;
  }

  emitEvent(event, ...args) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](...args);
    }
  }

  connect(token) {
    this.socket = io(this.SERVER_URL, {
      auth: { token },
      withCredentials: true,
    });

    this.socket.on("connect", () => this.emitEvent("connect"));
    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
      this.emitEvent("game_over", { message: "Lost connection to server." });
    });

    this.socket.on("game_update", (gameState) =>
      this.emitEvent("game_update", gameState)
    );
    this.socket.on("move_made", (data) => this.emitEvent("move_made", data));
    this.socket.on("game_started", (message) =>
      this.emitEvent("game_started", message)
    );
    this.socket.on("move_error", (message) =>
      this.emitEvent("move_error", message)
    );
    this.socket.on("game_over", (data) => this.emitEvent("game_over", data));
    this.socket.on("receive_chat_message", (senderId, message) =>
      this.emitEvent("receive_chat_message", senderId, message)
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  createRoom(userId, callback) {
    if (!this.socket) return;
    this.socket.emit("create_room", userId, (response) => {
      callback(response);
    });
  }

  joinRoom(roomId, userId, callback) {
    if (!this.socket) return;
    this.socket.emit("join_room", roomId, userId, (response) => {
      callback(response);
    });
  }

  makeMove(move, userId, roomId) {
    if (!this.socket) return;
    this.socket.emit("make_move", { roomId, move, userId });
  }

  sendChatMessage(message, roomId) {
    if (!this.socket) return;
    this.socket.emit("send_chat_message", roomId, message);
  }
}

export default SocketClient;
