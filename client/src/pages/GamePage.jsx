import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import ChessBoard from "../components/ChessBoard";
import GameLobby from "../components/GameLobby";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GamePage = () => {
  const {
    roomId,
    role,
    message,
    players,
    isGameOver,
    turn,
    sendChatMessage,
    userId,
  } = useGame();
  const [inLobby, setInLobby] = useState(true);

  useEffect(() => {
    if (roomId) {
      setInLobby(false);
    }
  }, [roomId]);

  const opponent = players.find((p) => p.role !== role);
  const player = players.find((p) => p.role === role);

  if (inLobby) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <GameLobby onGameStart={() => setInLobby(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-8">
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        <motion.h1
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Realtime Chess
        </motion.h1>
        <Link
          to="/profile"
          className="text-blue-400 hover:text-blue-300 font-semibold"
        >
          View Profile & History →
        </Link>
      </div>

      <div className="text-lg mb-8 space-x-4">
        <span className="font-semibold">Room ID:</span>
        <code className="bg-gray-800 p-2 rounded text-yellow-400">
          {roomId}
        </code>
      </div>

      <div className="flex gap-12 w-full max-w-6xl">
        <div className="flex flex-col w-1/4">
          <PlayerCard
            username={opponent ? opponent.username : "Waiting..."}
            role={role === "white" ? "black" : "white"}
            isTurn={turn !== role}
          />
        </div>

        <div className="w-1/2 flex justify-center">
          <ChessBoard />
        </div>

        <div className="flex flex-col w-1/4">
          <PlayerCard
            username={player ? player.username : "You"}
            role={role}
            isTurn={turn === role}
          />
          <ChatWindow
            sendChatMessage={sendChatMessage}
            isGameOver={isGameOver}
            userId={userId}
          />
        </div>
      </div>

      <motion.div
        className={`mt-8 p-4 rounded-lg font-bold text-center text-xl ${
          isGameOver ? "bg-red-600" : "bg-blue-600"
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {isGameOver ? message : `It's ${turn.toUpperCase()}'s Turn!`}
      </motion.div>
    </div>
  );
};

const PlayerCard = ({ username, role, isTurn }) => (
  <motion.div
    className={`p-4 rounded-xl shadow-lg mb-4 w-full ${
      role === "white" ? "bg-gray-700" : "bg-gray-800"
    } transition-all duration-300`}
    style={{ border: isTurn ? "4px solid #3b82f6" : "4px solid transparent" }}
    whileHover={{ scale: 1.03 }}
  >
    <p className="text-xl font-semibold">{username}</p>
    <p className="text-sm text-gray-400">Playing as {role.toUpperCase()}</p>
    {isTurn && (
      <motion.div
        className="mt-2 text-green-400 font-bold"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        YOUR TURN
      </motion.div>
    )}
  </motion.div>
);

const ChatWindow = ({ sendChatMessage, isGameOver, userId }) => {
  const { chat } = useGame();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col h-96">
      <h3 className="text-xl font-bold mb-3 text-white">In-Game Chat</h3>
      <div className="flex-grow overflow-y-auto space-y-2 mb-3 pr-2">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.senderId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <motion.div
              className={`p-2 rounded-lg max-w-[80%] ${
                msg.senderId === userId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {msg.senderId !== userId && (
                <span className="text-xs font-semibold block opacity-75">
                  Opponent:
                </span>
              )}
              {msg.message}
            </motion.div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          disabled={isGameOver}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg font-semibold transition duration-200"
          disabled={isGameOver || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GamePage;
