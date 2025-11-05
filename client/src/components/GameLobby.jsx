import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";

const GameLobby = ({ onGameStart }) => {
  const { createRoom, joinRoom, userId } = useGame();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [error, setError] = useState("");

  const handleCreateRoom = () => {
    setError("");
    if (!userId) return setError("User not logged in.");

    createRoom((response) => {
      if (response.success) {
        onGameStart();
      } else {
        setError(response.msg);
      }
    });
  };

  const handleJoinRoom = () => {
    setError("");
    if (!userId || !roomIdInput)
      return setError("Missing room ID or login info.");

    joinRoom(roomIdInput, (response) => {
      if (response.success) {
        onGameStart();
      } else {
        setError(response.msg);
      }
    });
  };

  return (
    <motion.div
      className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-white mb-6">Start a New Game</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <button
        onClick={handleCreateRoom}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md"
      >
        Create Game Room
      </button>

      <div className="my-6 text-gray-400 text-lg">OR</div>

      <div className="w-full">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleJoinRoom}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md"
        >
          Join Game Room
        </button>
      </div>
    </motion.div>
  );
};

export default GameLobby;
