import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import { Chess } from "chess.js";

const pieceMap = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

const ChessBoard = () => {
  const { game, fen, role, isGameOver, turn, makeMove } = useGame();

  const [squareStyles, setSquareStyles] = useState({});
  const [selectedSquare, setSelectedSquare] = useState(null);

  const board = game.board();
  const isWhite = role === "white";
  const isPlayerTurn = role === turn;

  const getSquareColor = (row, col) => {
    return (row + col) % 2 === 0 ? "square-light" : "square-dark";
  };

  // Logic for onSquareClick and highlightMoves remains correct.

  const onSquareClick = (square) => {
    if (isGameOver || !isPlayerTurn) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && (piece.color === "w" ? "white" : "black") === role) {
        setSelectedSquare(square);
        highlightMoves(square);
      }
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
      setSquareStyles({});
    } else {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: "q",
      };

      const tempGame = new Chess(fen);
      const moveResult = tempGame.move(move);

      if (moveResult) {
        makeMove(move);
        setSelectedSquare(null);
        setSquareStyles({});
      } else {
        setSelectedSquare(square);
        highlightMoves(square);
      }
    }
  };

  const highlightMoves = (square) => {
    const moves = game.moves({ square, verbose: true });
    const styles = {};
    moves.forEach((move) => {
      styles[move.to] = { backgroundColor: "rgba(0, 255, 0, 0.3)" };
    });
    setSquareStyles({
      [square]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
      ...styles,
    });
  };

  const getSquareCoordinates = (rankIndex, fileIndex) => {
    const file = String.fromCharCode("a".charCodeAt(0) + fileIndex);
    const rank = (rankIndex + 1).toString();
    return file + rank;
  };

  // MODIFIED: Accepts the array indices (rI, fI) directly.
  const renderPiece = (piece, square, rI, fI) => {
    if (!piece) return null;
    const char = pieceMap[piece.type];
    const color = piece.color === "w" ? "text-white" : "text-black";

    // rI (Rank Index) runs from 0 (rank 8) to 7 (rank 1)
    // fI (File Index) runs from 0 (file a) to 7 (file h)

    // Calculate position based on player's perspective (isWhite)
    const x = isWhite ? fI * 12.5 : (7 - fI) * 12.5;
    const y = isWhite ? rI * 12.5 : (7 - rI) * 12.5; // Use rI directly

    return (
      <motion.div
        key={square}
        className={`absolute text-5xl font-bold cursor-pointer transition-colors duration-200 ${color}`}
        style={{
          width: "12.5%",
          height: "12.5%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          lineHeight: 1,
        }}
        initial={false}
        animate={{ x: `${x}%`, y: `${y}%` }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          onSquareClick(square);
        }}
      >
        {char}
      </motion.div>
    );
  };

  return (
    <div className="relative w-[40rem] h-[40rem] shadow-2xl rounded-lg overflow-hidden border-8 border-gray-900">
      {/* 1. Board Squares Layer */}
      <div
        className={`grid grid-cols-8 grid-rows-8 w-full h-full ${
          isWhite ? "" : "rotate-180"
        }`}
        style={{ transformOrigin: "center" }}
      >
        {Array.from({ length: 8 }).map((_, rankIndex) =>
          Array.from({ length: 8 }).map((_, fileIndex) => {
            // Determine the algebraic square name for the current grid cell
            const square = isWhite
              ? getSquareCoordinates(7 - rankIndex, fileIndex) // e.g., 7-0=7 -> rank 8
              : getSquareCoordinates(rankIndex, 7 - fileIndex); // e.g., 0 -> rank 1

            // This is for the grid square rendering, not the piece
            return (
              <div
                key={square}
                className={`${getSquareColor(
                  rankIndex,
                  fileIndex
                )} flex justify-center items-center relative transition-all duration-300`}
                style={{ ...squareStyles[square] }}
                onClick={() => onSquareClick(square)}
              >
                <div
                  className={`text-xs absolute ${
                    isWhite
                      ? "top-0 left-0 p-1"
                      : "bottom-0 right-0 p-1 rotate-180"
                  }`}
                >
                  {square}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Piece Layer - Iterate over the 2D array to get correct indices */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {board.flat().map((p, index) => {
          if (!p) return null;

          // CRITICAL: Get the rank and file indices from the flattened array index
          const rankIndex = Math.floor(index / 8);
          const fileIndex = index % 8;

          // Calculate the algebraic square name (for piece key and square arg)
          // The board array is 0=Rank 8, 7=Rank 1, so we map 7-rI+1 for the rank number
          const square = getSquareCoordinates(7 - rankIndex, fileIndex);

          // Pass the necessary indices (rankIndex and fileIndex) to renderPiece
          return renderPiece(p, square, rankIndex, fileIndex);
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
