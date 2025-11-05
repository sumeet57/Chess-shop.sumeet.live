import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Chess } from "chess.js";
import SocketClient from "../api/SocketClient";

const GameContext = createContext();

export const GameProvider = ({ children, currentUserId }) => {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState(null);
  const [role, setRole] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState("Welcome to Chess!");
  const [turn, setTurn] = useState("white");
  const [chat, setChat] = useState([]);

  const socketClientRef = useRef(null);

  const userId = currentUserId;

  const handleGameUpdate = useCallback((gameState) => {
    const newGame = new Chess(gameState.fen);
    setFen(gameState.fen);
    setGame(newGame);
    setPlayers(gameState.players);
    setTurn(gameState.turn);
    setMessage(
      gameState.players.length < 2
        ? "Waiting for opponent..."
        : "Game in progress."
    );
  }, []);

  const handleMoveMade = useCallback((data) => {
    const movedGame = new Chess(data.fen);
    setFen(data.fen);
    setGame(movedGame);
    setTurn(data.turn);
    setMessage(data.isCheck ? "Check!" : "");
  }, []);

  const handleGameOver = useCallback((data) => {
    setIsGameOver(true);
    setMessage(data.message);
  }, []);

  const handleMoveError = useCallback(
    (msg) => {
      console.error("Move Error:", msg);
      setMessage(msg);
      setGame(new Chess(fen));
    },
    [fen]
  );

  const handleChatMessage = useCallback((senderId, message) => {
    setChat((prev) => [...prev, { senderId, message }]);
  }, []);

  useEffect(() => {
    if (userId && !socketClientRef.current) {
      const client = new SocketClient();

      client.on("game_update", handleGameUpdate);
      client.on("move_made", handleMoveMade);
      client.on("game_over", handleGameOver);
      client.on("move_error", handleMoveError);
      client.on("receive_chat_message", handleChatMessage);

      client.connect();
      socketClientRef.current = client;
    }

    return () => {
      if (socketClientRef.current) {
        socketClientRef.current.disconnect();
        socketClientRef.current = null;
      }
    };
  }, [
    userId,
    handleGameUpdate,
    handleMoveMade,
    handleGameOver,
    handleMoveError,
    handleChatMessage,
  ]);

  const createRoom = (callback) => {
    if (!socketClientRef.current || !userId)
      return callback({
        success: false,
        msg: "Client not connected/logged in.",
      });

    socketClientRef.current.createRoom(userId, (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setRole(response.role);
        socketClientRef.current.currentRoomId = response.roomId;
      }
      callback(response);
    });
  };

  const joinRoom = (id, callback) => {
    if (!socketClientRef.current || !userId)
      return callback({
        success: false,
        msg: "Client not connected/logged in.",
      });

    socketClientRef.current.joinRoom(id, userId, (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setRole(response.role);
        socketClientRef.current.currentRoomId = response.roomId;
      }
      callback(response);
    });
  };

  const makeMove = (move) => {
    if (!socketClientRef.current || !roomId) return;
    socketClientRef.current.makeMove(move, userId, roomId);
  };

  const sendChatMessage = (msg) => {
    if (!socketClientRef.current || !roomId) return;
    socketClientRef.current.sendChatMessage(msg, roomId);
  };

  const contextValue = {
    fen,
    game,
    roomId,
    role,
    players,
    isGameOver,
    message,
    turn,
    chat,
    userId,
    createRoom,
    joinRoom,
    makeMove,
    sendChatMessage,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

export const useGame = () => React.useContext(GameContext);
