import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

const Profile = () => {
  const { state } = useAuth();
  const { user, loading } = state;
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setHistoryLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/user/history?page=1&limit=10`,
          {
            withCredentials: true,
          }
        );
        setHistory(res.data.history);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-2xl">
        Loading Profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-400 text-2xl">
        User data not available.
      </div>
    );
  }

  const { username, email, wins, losses, draws, _id } = user; // Destructure _id for history table

  return (
    <motion.div
      className="flex flex-col items-center min-h-screen bg-gray-900 p-8 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link
        to="/"
        className="text-blue-400 hover:text-blue-300 self-start mb-6"
      >
        ← Back to Game Lobby
      </Link>
      <motion.div
        className="bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-4xl border-t-4 border-blue-500"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-400">
          {username}'s Profile
        </h2>

        <h3 className="text-2xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2 text-yellow-400">
          Game Statistics
        </h3>

        <div className="grid grid-cols-3 gap-4 text-center mb-10">
          <StatsCard title="Wins" count={wins} color="text-green-400" />
          <StatsCard title="Losses" count={losses} color="text-red-400" />
          <StatsCard title="Draws" count={draws} color="text-gray-400" />
        </div>

        <h3 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 text-purple-400">
          Match History (Last 10)
        </h3>

        {historyLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No games recorded yet.</p>
        ) : (
          <HistoryTable history={history} currentUserId={_id} />
        )}
      </motion.div>
    </motion.div>
  );
};

const StatsCard = ({ title, count, color }) => (
  <motion.div
    className="bg-gray-700 p-4 rounded-lg shadow-md"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <p className="text-sm text-gray-400">{title}</p>
    <p className={`text-4xl font-extrabold ${color}`}>{count}</p>
  </motion.div>
);

const HistoryTable = ({ history, currentUserId }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-700">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            Opponent
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            Result
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            Moves
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            Captured
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            Date
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {history.map((game) => {
          const player = game.players.find(
            (p) => p.userId._id === currentUserId
          );
          const opponent = game.players.find(
            (p) => p.userId._id !== currentUserId
          );
          const opponentName = opponent ? opponent.userId.username : "N/A";

          let resultText = "";
          let resultColor = "text-gray-400";
          if (game.status === "completed" && game.winner === currentUserId) {
            resultText = "Win (Checkmate)";
            resultColor = "text-green-400";
          } else if (
            game.status === "completed" &&
            game.winner !== currentUserId
          ) {
            resultText = "Loss (Checkmate)";
            resultColor = "text-red-400";
          } else if (
            game.status === "abandoned" &&
            game.winner === currentUserId
          ) {
            resultText = "Win (Abandoned)";
            resultColor = "text-green-400";
          } else if (game.status === "draw") {
            resultText = "Draw";
            resultColor = "text-yellow-400";
          } else {
            resultText = game.status;
          }

          return (
            <tr key={game._id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {opponentName}
              </td>
              <td
                className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                style={{ color: resultColor }}
              >
                {resultText}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {player.moves}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {player.capturedPieces.join(", ") || "None"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {new Date(game.startDate).toLocaleDateString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default Profile;
