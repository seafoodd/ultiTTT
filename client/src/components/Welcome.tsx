import { useEffect, useState } from "react";
import Button from "../shared/ui/Button";
import BoardPreview from "./BoardPreview";
import { useNavigate } from "react-router-dom";
import { checkGameWinner, checkSubWinner } from "@/shared/lib/client/gameUtils";

const Welcome = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState({
    board: Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
    turn: "X",
    winner: "",
  });

  const makeRandomMove = () => {
    setGame((prevGame) => {
      let newBoard = [...prevGame.board];
      const availableMoves: any[] = [];

      newBoard.forEach((subBoard, subBoardIndex) => {
        if (!subBoard.subWinner) {
          subBoard.squares.forEach((square, squareIndex) => {
            if (!square) {
              availableMoves.push({ subBoardIndex, squareIndex });
            }
          });
        }
      });
      const gameWinner = checkGameWinner(newBoard);
      if (availableMoves.length > 0 && !gameWinner) {
        const randomMove =
          availableMoves[Math.floor(Math.random() * availableMoves.length)];
        newBoard[randomMove.subBoardIndex].squares[randomMove.squareIndex] =
          prevGame.turn;
        newBoard[randomMove.subBoardIndex].subWinner = checkSubWinner(
          newBoard[randomMove.subBoardIndex].squares
        );
        const nextTurn = prevGame.turn === "X" ? "O" : "X";
        return { ...prevGame, board: newBoard, turn: nextTurn };
      } else {
        return {
          board: Array.from({ length: 9 }, () => ({
            subWinner: "",
            squares: Array(9).fill(""),
          })),
          turn: "X",
          winner: "",
        };
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(makeRandomMove, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-8 overflow-x-hidden">
      <h1 className="text-3xl font-medium lg:mt-4 xl:mt-8">
        Sign Up or Log In to Play
        <br />
        <span className="text-amber-400 font-semibold">
          Ultimate Tic-Tac-Toe
        </span>
        <br />
        Now!
      </h1>
      <div className="mt-12 md:mt-18 flex gap-8 flex-col md:flex-row justify-center items-center">
        <Button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-500 w-48 py-4"
        >
          log in
        </Button>
        <Button
          onClick={() => navigate("/signup")}
          className="bg-gray-600 hover:bg-gray-500 w-48 py-4"
        >
          Sign Up
        </Button>
      </div>
      <div className="mt-16">
        <BoardPreview board={game.board} size={350} />
      </div>
    </div>
  );
};

export default Welcome;
