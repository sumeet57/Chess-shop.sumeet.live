import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  players: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["white", "black"],
        required: true,
      },
      moves: {
        type: Number,
        default: 0,
      },
      capturedPieces: {
        type: [String],
        default: [],
      },
    },
  ],
  status: {
    type: String,
    enum: ["in-progress", "completed", "draw", "abandoned"],
    default: "in-progress",
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  fen: {
    type: String,
    required: true,
  },
  movesHistory: {
    type: [String],
    default: [],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
});

const Game = mongoose.model("Game", GameSchema);
export default Game;
