import { Chess } from "chess.js";
import User from "../models/user.model.js";
import Game from "../models/game.model.js";

class ChessGame {
  constructor(roomId, gameDbId, creator) {
    this.roomId = roomId;
    this.gameDbId = gameDbId;
    this.chess = new Chess();
    this.players = [
      {
        id: creator.id,
        username: creator.username,
        role: "white",
        socketId: creator.socketId,
      },
    ];
  }

  addPlayer(player) {
    const role =
      this.players.length === 1
        ? this.players[0].role === "white"
          ? "black"
          : "white"
        : null;
    if (role) {
      this.players.push({
        id: player.id,
        username: player.username,
        role,
        socketId: player.socketId,
      });
    }
    return role;
  }

  updatePlayerSocket(userId, socketId) {
    const player = this.players.find((p) => p.id === userId);
    if (player) {
      player.socketId = socketId;
    }
  }

  getPlayerBySocketId(socketId) {
    return this.players.find((p) => p.socketId === socketId);
  }

  isPlayerInGame(socketId) {
    return this.players.some((p) => p.socketId === socketId);
  }

  getCurrentState() {
    return {
      fen: this.chess.fen(),
      players: this.players.map((p) => ({
        id: p.id,
        username: p.username,
        role: p.role,
      })),
      turn: this.chess.turn() === "w" ? "white" : "black",
    };
  }

  async makeMove(userId, move) {
    const player = this.players.find((p) => p.id === userId);
    if (!player) return { success: false, msg: "Player not in game" };

    const turn = this.chess.turn() === "w" ? "white" : "black";
    if (player.role !== turn) return { success: false, msg: "Not your turn" };

    const result = this.chess.move(move);

    if (result) {
      const updateData = {
        $inc: { "players.$.moves": 1 },
        $set: { fen: this.chess.fen() },
        $push: { movesHistory: result.san },
        ...(result.captured && {
          $push: { "players.$.capturedPieces": result.captured },
        }),
      };

      await Game.updateOne(
        { _id: this.gameDbId, "players.userId": userId },
        updateData
      );

      const status = this.checkGameOver();

      return {
        success: true,
        fen: this.chess.fen(),
        lastMove: result,
        isCheck: this.chess.inCheck(),
        gameOverStatus: status,
      };
    } else {
      return { success: false, msg: "Invalid move" };
    }
  }

  checkGameOver() {
    if (!this.chess.isGameOver()) return null;

    let status,
      winnerId = null;
    let message = "Game Over";
    const turn = this.chess.turn() === "w" ? "white" : "black";

    if (this.chess.isCheckmate()) {
      status = "completed";
      const winnerRole = turn === "black" ? "white" : "black";
      const winner = this.players.find((p) => p.role === winnerRole);
      winnerId = winner.id;
      message = `${winnerRole.toUpperCase()} wins by checkmate!`;
    } else if (
      this.chess.isStalemate() ||
      this.chess.isThreefoldRepetition() ||
      this.chess.isInsufficientMaterial() ||
      this.chess.isDraw()
    ) {
      status = "draw";
      message = "Game Over: Draw!";
    }

    this.updateGameStats(status, winnerId);
    return { message, winnerId, status };
  }

  async handleDisconnection(disconnectedSocketId) {
    if (this.players.length === 1) {
      await Game.deleteOne({ _id: this.gameDbId });
      return { action: "delete_room" };
    }

    const disconnectedPlayer = this.players.find(
      (p) => p.socketId === disconnectedSocketId
    );
    if (!disconnectedPlayer) return { action: "none" };

    const remainingPlayer = this.players.find(
      (p) => p.socketId !== disconnectedSocketId
    );

    const status = "abandoned";
    const winnerId = remainingPlayer.id;
    const message = `${remainingPlayer.role.toUpperCase()} wins by opponent abandonment!`;

    await this.updateGameStats(status, winnerId);
    return { action: "game_over", message, winnerId, status };
  }

  async updateGameStats(status, winnerId) {
    if (status === "completed" || status === "abandoned") {
      const loserId = this.players.find((p) => p.id !== winnerId).id;
      await User.updateOne({ _id: winnerId }, { $inc: { wins: 1 } });
      await User.updateOne({ _id: loserId }, { $inc: { losses: 1 } });
    } else if (status === "draw") {
      for (const p of this.players) {
        await User.updateOne({ _id: p.id }, { $inc: { draws: 1 } });
      }
    }
    await Game.updateOne(
      { _id: this.gameDbId },
      { status, winner: winnerId, endDate: new Date() }
    );
  }
}

export default ChessGame;
