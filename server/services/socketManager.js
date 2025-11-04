import ActiveGames from "./ActiveGames.js";
import ChessGame from "./ChessGame.js";
import { Chess } from "chess.js";
import User from "../models/user.model.js";
import Game from "../models/game.model.js";

class SocketManager {
  constructor(io) {
    this.io = io;
    this.activeGames = ActiveGames;
  }

  handleConnection(socket) {
    socket.on("create_room", (userId, callback) =>
      this.createRoom(socket, userId, callback)
    );
    socket.on("join_room", (roomId, userId, callback) =>
      this.joinRoom(socket, roomId, userId, callback)
    );
    socket.on("make_move", (data) => this.makeMove(socket, data));
    socket.on("disconnecting", () => this.handleDisconnection(socket));

    socket.on("send_chat_message", (roomId, message) => {
      socket.to(roomId).emit("receive_chat_message", socket.id, message);
    });
  }

  async createRoom(socket, userId, callback) {
    try {
      const user = await User.findById(userId).select("username");
      if (!user) return callback({ success: false, msg: "User not found" });

      const roomId = Math.random().toString(36).substring(2, 9);

      const gameDb = new Game({
        roomId,
        players: [{ userId: user._id, role: "white" }],
        fen: new Chess().fen(),
      });
      await gameDb.save();

      const gameInstance = new ChessGame(roomId, gameDb._id.toString(), {
        id: userId,
        username: user.username,
        socketId: socket.id,
      });

      socket.join(roomId);
      this.activeGames.setGame(roomId, gameInstance);

      callback({ success: true, roomId, role: "white" });
      this.io.to(roomId).emit("game_update", gameInstance.getCurrentState());
    } catch (error) {
      console.error(error);
      callback({ success: false, msg: "Server error on room creation" });
    }
  }

  async joinRoom(socket, roomId, userId, callback) {
    const gameInstance = this.activeGames.getGame(roomId);
    if (!gameInstance)
      return callback({ success: false, msg: "Room not found" });
    if (gameInstance.players.length === 2) {
      const existingPlayer = gameInstance.players.find((p) => p.id === userId);
      if (existingPlayer) {
        socket.join(roomId);
        gameInstance.updatePlayerSocket(userId, socket.id);
        callback({ success: true, roomId, role: existingPlayer.role });
        this.io.to(roomId).emit("game_update", gameInstance.getCurrentState());
        return;
      }
      return callback({ success: false, msg: "Room is full" });
    }

    try {
      const user = await User.findById(userId).select("username");
      if (!user) return callback({ success: false, msg: "User not found" });

      const role = gameInstance.addPlayer({
        id: userId,
        username: user.username,
        socketId: socket.id,
      });

      await Game.updateOne(
        { _id: gameInstance.gameDbId },
        { $push: { players: { userId: user._id, role } } }
      );

      socket.join(roomId);
      callback({ success: true, roomId, role });

      this.io.to(roomId).emit("game_update", gameInstance.getCurrentState());
      this.io
        .to(roomId)
        .emit("game_started", "Game has two players and is starting!");
    } catch (error) {
      console.error(error);
      callback({ success: false, msg: "Server error on room join" });
    }
  }

  async makeMove(socket, { roomId, move, userId }) {
    const gameInstance = this.activeGames.getGame(roomId);
    if (!gameInstance) return socket.emit("move_error", "Game not active");

    const result = await gameInstance.makeMove(userId, move);

    if (result.success) {
      this.io.to(roomId).emit("move_made", {
        fen: result.fen,
        lastMove: result.lastMove,
        isCheck: result.isCheck,
        turn: gameInstance.chess.turn() === "w" ? "white" : "black",
      });

      if (result.gameOverStatus) {
        this.io.to(roomId).emit("game_over", result.gameOverStatus);
        this.activeGames.deleteGame(roomId);
      }
    } else {
      socket.emit("move_error", result.msg);
    }
  }

  async handleDisconnection(socket) {
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
    for (const roomId of rooms) {
      const gameInstance = this.activeGames.getGame(roomId);
      if (gameInstance) {
        const result = await gameInstance.handleDisconnection(socket.id);

        if (result.action === "game_over") {
          this.io.to(roomId).emit("game_over", result);
          this.activeGames.deleteGame(roomId);
        } else if (result.action === "delete_room") {
          this.activeGames.deleteGame(roomId);
        }
      }
    }
  }
}

export default SocketManager;
