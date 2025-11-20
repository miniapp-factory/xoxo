"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function randomTile() {
  return Math.random() < TILE_PROBABILITIES[0] ? 2 : 4;
}

function emptyPositions(board: number[][]) {
  const positions: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) positions.push([r, c]);
    }
  }
  return positions;
}

function addRandomTile(board: number[][]) {
  const empties = emptyPositions(board);
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = randomTile();
  return newBoard;
}

function mergeLine(line: number[]) {
  const filtered = line.filter(v => v !== 0);
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return merged;
}

function move(board: number[][], dir: "up" | "down" | "left" | "right") {
  let newBoard = board.map(row => [...row]);
  let changed = false;
  if (dir === "left") {
    for (let r = 0; r < SIZE; r++) {
      const merged = mergeLine(newBoard[r]);
      if (!changed && merged.some((v, i) => v !== newBoard[r][i])) changed = true;
      newBoard[r] = merged;
    }
  } else if (dir === "right") {
    for (let r = 0; r < SIZE; r++) {
      const rev = [...newBoard[r]].reverse();
      const merged = mergeLine(rev).reverse();
      if (!changed && merged.some((v, i) => v !== newBoard[r][i])) changed = true;
      newBoard[r] = merged;
    }
  } else if (dir === "up") {
    for (let c = 0; c < SIZE; c++) {
      const col = newBoard.map(row => row[c]);
      const merged = mergeLine(col);
      if (!changed && merged.some((v, i) => v !== newBoard[i][c])) changed = true;
      for (let r = 0; r < SIZE; r++) newBoard[r][c] = merged[r];
    }
  } else if (dir === "down") {
    for (let c = 0; c < SIZE; c++) {
      const col = newBoard.map(row => row[c]).reverse();
      const merged = mergeLine(col).reverse();
      if (!changed && merged.some((v, i) => v !== newBoard[i][c])) changed = true;
      for (let r = 0; r < SIZE; r++) newBoard[r][c] = merged[r];
    }
  }
  return { board: newBoard, changed };
}

function hasMoves(board: number[][]) {
  if (emptyPositions(board).length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (c + 1 < SIZE && board[r][c + 1] === v) return true;
      if (r + 1 < SIZE && board[r + 1][c] === v) return true;
    }
  }
  return false;
}

export function Game2048() {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    let b = addRandomTile(addRandomTile(board));
    setBoard(b);
  }, []);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const { board: newBoard, changed } = move(board, dir);
    if (!changed) return;
    const newScore = newBoard.flat().reduce((s, v) => s + v, 0);
    setScore(newScore);
    setBoard(newBoard);
    if (newBoard.flat().some(v => v === 2048)) setWon(true);
    if (!hasMoves(newBoard)) setGameOver(true);
  };

  const shareText = `I scored ${score} in 2048! ${url}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((v, idx) => (
          <div key={idx} className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded">
            {v !== 0 && <span className="text-xl font-bold">{v}</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleMove("up")}>↑</Button>
        <Button onClick={() => handleMove("down")}>↓</Button>
        <Button onClick={() => handleMove("left")}>←</Button>
        <Button onClick={() => handleMove("right")}>→</Button>
      </div>
      <div className="text-lg">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-xl">{won ? "You won!" : "Game Over"}</div>
          <Share text={shareText} />
        </div>
      )}
    </div>
  );
}
