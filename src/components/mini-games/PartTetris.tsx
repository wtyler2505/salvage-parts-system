import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCw, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TetrisPiece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const PIECE_SHAPES = [
  // I-piece
  [
    [1, 1, 1, 1]
  ],
  // O-piece
  [
    [1, 1],
    [1, 1]
  ],
  // T-piece
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // S-piece
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // Z-piece
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // J-piece
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // L-piece
  [
    [0, 0, 1],
    [1, 1, 1]
  ]
];

const PIECE_COLORS = [
  '#00f0f0', // Cyan
  '#f0f000', // Yellow
  '#a000f0', // Purple
  '#00f000', // Green
  '#f00000', // Red
  '#0000f0', // Blue
  '#f0a000'  // Orange
];

const PartTetris: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastDropRef = useRef<number>(0);

  const createPiece = useCallback((): TetrisPiece => {
    const shapeIndex = Math.floor(Math.random() * PIECE_SHAPES.length);
    return {
      shape: PIECE_SHAPES[shapeIndex],
      color: PIECE_COLORS[shapeIndex],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(PIECE_SHAPES[shapeIndex][0].length / 2),
      y: 0
    };
  }, []);

  const rotatePiece = (piece: TetrisPiece): TetrisPiece => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidPosition = useCallback((piece: TetrisPiece, board: number[][], dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece: TetrisPiece, board: number[][]): number[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = PIECE_COLORS.indexOf(piece.color) + 1;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || !isPlaying || gameOver) return;
    
    if (isValidPosition(currentPiece, board, dx, dy)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
    } else if (dy > 0) {
      // Piece can't move down, place it
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(Math.floor(lines / 10) + 1);
      
      // Spawn next piece
      if (nextPiece && isValidPosition(nextPiece, clearedBoard)) {
        setCurrentPiece(nextPiece);
        setNextPiece(createPiece());
      } else {
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  }, [currentPiece, board, isPlaying, gameOver, isValidPosition, placePiece, clearLines, nextPiece, createPiece, level, lines]);

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return;
    
    const rotated = rotatePiece(currentPiece);
    if (isValidPosition(rotated, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, board, isPlaying, gameOver, isValidPosition]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!isPlaying || gameOver) return;
    
    const dropInterval = Math.max(50, 500 - (level - 1) * 50);
    
    if (timestamp - lastDropRef.current > dropInterval) {
      movePiece(0, 1);
      lastDropRef.current = timestamp;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, gameOver, level, movePiece]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece(createPiece());
    setNextPiece(createPiece());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotatePieceHandler();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotatePieceHandler]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = PIECE_COLORS.indexOf(currentPiece.color) + 1;
            }
          }
        }
      }
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 border border-gray-600"
            style={{
              backgroundColor: cell ? PIECE_COLORS[cell - 1] : '#000'
            }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    return nextPiece.shape.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-4 h-4 border border-gray-600"
            style={{
              backgroundColor: cell ? nextPiece.color : 'transparent'
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Part Tetris</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="flex space-x-6">
          {/* Game Board */}
          <div className="flex flex-col items-center">
            <div className="border-2 border-gray-400 bg-black p-2">
              {renderBoard()}
            </div>
            
            {/* Controls */}
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => movePiece(-1, 0)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!isPlaying || gameOver}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => movePiece(0, 1)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!isPlaying || gameOver}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => movePiece(1, 0)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!isPlaying || gameOver}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={rotatePieceHandler}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={!isPlaying || gameOver}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
              <h3 className="font-bold mb-2">Score</h3>
              <div className="space-y-1 text-sm">
                <div>Score: {score}</div>
                <div>Level: {level}</div>
                <div>Lines: {lines}</div>
              </div>
            </div>
            
            {/* Next Piece */}
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
              <h3 className="font-bold mb-2">Next</h3>
              <div className="bg-black p-2 rounded">
                {renderNextPiece()}
              </div>
            </div>
            
            {/* Game Controls */}
            <div className="space-y-2">
              {!isPlaying && !gameOver && (
                <button
                  onClick={startGame}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Game</span>
                </button>
              )}
              
              {isPlaying && (
                <button
                  onClick={pauseGame}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center justify-center space-x-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}
              
              {gameOver && (
                <div className="text-center">
                  <div className="text-red-500 font-bold mb-2">Game Over!</div>
                  <button
                    onClick={startGame}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm">
              <h3 className="font-bold mb-2">Controls</h3>
              <div className="space-y-1">
                <div>← → Move</div>
                <div>↓ Drop</div>
                <div>↑ / Space Rotate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartTetris;