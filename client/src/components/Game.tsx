import { useEffect, useState } from "react";
import Board from "./Board";
import {
  FaBackwardStep,
  FaForwardStep,
  FaBackwardFast,
  FaForwardFast,
} from "react-icons/fa6";

interface GameProps {
  socket: any;
  gameId: string;
}

interface GameState {
  board: { subWinner: string; squares: string[] }[];
  player: string;
  turn: string;
  currentSubBoard: number | null;
  victoryMessage: string;
  playersJoined: boolean;
  moveHistory: { subBoardIndex: number; squareIndex: number; player: string }[];
  players: { id: string; symbol: string }[];
}

const Game: React.FC<GameProps> = ({ socket, gameId }) => {
  const [playersJoined, setPlayersJoined] = useState<boolean>(false);

  const [board, setBoard] = useState<
    { subWinner: string; squares: string[] }[]
  >(
    Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
  );
  const [timers, setTimers] = useState<{ X: number; O: number }>({
    X: 600,
    O: 600,
  });
  const [moveHistory, setMoveHistory] = useState<
    { subBoardIndex: number; squareIndex: number; player: string }[]
  >([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);

  const [player, setPlayer] = useState<string>("");
  const [turn, setTurn] = useState<string>("X");
  const [currentSubBoard, setCurrentSubBoard] = useState<number | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string>("");

  useEffect(() => {
    const handleGameState = (gameState: GameState) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
      setMoveHistory(gameState.moveHistory);
      setCurrentMoveIndex(gameState.moveHistory.length);
      setCurrentSubBoard(gameState.currentSubBoard);
      const currentPlayer = gameState.players.find(
        (p: any) => p.id === socket.id,
      );
      if (currentPlayer) {
        setPlayer(currentPlayer.symbol);
      }
    };

    const handleGameResult = (result: any) => {
      setVictoryMessage(
        result.state === "Won" ? `Player ${result.winner} wins!` : "Game tied!",
      );
    };

    const handleTimerUpdate = (updatedTimers: { X: number; O: number }) => {
      setTimers(updatedTimers);
    };

    socket.on("gameState", (gameState: GameState) => {
      if (!playersJoined && gameState.players.length === 2) {
        setPlayersJoined(true);
      }
      handleGameState(gameState);
    });
    socket.on("gameResult", handleGameResult);
    socket.on("timerUpdate", handleTimerUpdate);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameResult", handleGameResult);
      socket.off("timerUpdate", handleTimerUpdate);
    };
  }, [socket, playersJoined]);

  const chooseSquare = (subBoardIndex: number, squareIndex: number) => {
    if (turn === player && board[subBoardIndex].squares[squareIndex] === "") {
      socket.emit("makeMove", { gameId, subBoardIndex, squareIndex, player });
    }
  };

  const getBoardAtMove = (moveIndex: number) => {
    const newBoard = Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    }));
    moveHistory.slice(0, moveIndex).forEach((move) => {
      newBoard[move.subBoardIndex].squares[move.squareIndex] = move.player;
      if (checkWin(newBoard[move.subBoardIndex].squares)) {
        newBoard[move.subBoardIndex].subWinner = move.player;
      }
    });
    return newBoard;
  };

  useEffect(() => {
    setBoard(getBoardAtMove(currentMoveIndex));
  }, [currentMoveIndex, moveHistory]);

  if (!playersJoined) {
    return <div>Waiting for other player to join...</div>;
  }

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:h-[640px]">
        <Board
          lastMove={moveHistory[currentMoveIndex - 1]}
          currentMoveSelected={currentMoveIndex === moveHistory.length}
          board={board}
          turn={turn}
          player={player}
          chooseSquare={chooseSquare}
          victoryMessage={victoryMessage}
          currentSubBoard={currentSubBoard}
        />
        <div className="flex flex-col w-full lg:w-80 h-full">
          <div className="flex flex-col w-full h-full rounded-xl overflow-hidden">
            <div className="h-8 bg-white/15 border-b border-white/10">
              Timer {player === "X" ? "O" : "X"}:{" "}
              {player === "X" ? timers.O : timers.X} seconds
            </div>
            <div className="flex max-w-[320px] sm:max-w-[640px] flex-wrap lg:flex-col lg:overflow-y-auto h-full lg:overflow-x-hidden lg:w-80 bg-gray-800">
              {moveHistory
                .reduce(
                  (acc, move, index) => {
                    const movePairIndex = Math.floor(index / 2);
                    if (!acc[movePairIndex]) {
                      acc[movePairIndex] = [];
                    }
                    acc[movePairIndex].push(move);
                    return acc;
                  },
                  [] as {
                    subBoardIndex: number;
                    squareIndex: number;
                    player: string;
                  }[][],
                )
                .map((movePair, pairIndex) => (
                  <div key={pairIndex} className="flex items-center">
                    <div className="border-r border-l lg:border-l-0 border-white/10 bg-white/5 text-white/40 min-w-12">
                      {pairIndex + 1}
                    </div>
                    <div className="flex flex-row bg-gray-800 w-full justify-start">
                      {movePair.map((move, index) => (
                        <div
                          key={index}
                          className={`flex flex-1 max-w-[107px] justify-between cursor-pointer
                        px-1.5 hover:bg-white/10 items-center text-[16px]
                        ${move.player === "X" ? "text-color-1" : "text-color-2"}
                        ${
                          pairIndex * 2 + index + 1 === currentMoveIndex
                            ? "bg-white/25 font-bold"
                            : "font-medium"
                        }`}
                          onClick={() =>
                            setCurrentMoveIndex(pairIndex * 2 + index + 1)
                          }
                        >
                          <div className='w-8'>
                            {move.subBoardIndex + 1}-{move.squareIndex + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            <div className="h-8 bg-white/15 border-t rounded-b-lg border-white/10">
              Timer {player === "X" ? "X" : "O"}:{" "}
              {player === "X" ? timers.X : timers.O} seconds
            </div>
          </div>
          <div className="flex justify-center gap-8 items-center py-2 -mb-8">
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(0)}
              disabled={currentMoveIndex <= 0}
            >
              <FaBackwardFast />
            </button>
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(currentMoveIndex - 1)}
              disabled={currentMoveIndex <= 0}
            >
              <FaBackwardStep />
            </button>
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(currentMoveIndex + 1)}
              disabled={currentMoveIndex >= moveHistory.length}
            >
              <FaForwardStep />
            </button>
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(moveHistory.length)}
              disabled={currentMoveIndex >= moveHistory.length}
            >
              <FaForwardFast />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;

const checkWin = (board: string[]) => {
  const Patterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < Patterns.length; i++) {
    const [a, b, c] = Patterns[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
};
