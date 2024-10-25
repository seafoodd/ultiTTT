import Square from "./Square.jsx";

const Board = ({ board, turn, player, victoryMessage, chooseSquare }) => {
  return (
    <div className="relative flex flex-col w-[500px] h-[500px]">
      {victoryMessage && (
        <div
          className="absolute inset-0 flex justify-center
         items-center backdrop-blur-[3px] z-10"
        >
          <h1 className="text-black text-4xl font-semibold">
            {victoryMessage}
          </h1>
        </div>
      )}
      <div className="flex flex-[33%] ">
        <Square
          chooseSquare={() => chooseSquare(0)}
          val={board[0]}
          isYourTurn={turn === player}
        />
        <Square
          chooseSquare={() => chooseSquare(1)}
          val={board[1]}
          isYourTurn={turn === player}
        />
        <Square
          chooseSquare={() => chooseSquare(2)}
          val={board[2]}
          isYourTurn={turn === player}
        />
      </div>
      <div className="flex flex-[33%] ">
        <Square
          chooseSquare={() => chooseSquare(3)}
          val={board[3]}
          isYourTurn={turn === player}
        />
        <Square
          chooseSquare={() => chooseSquare(4)}
          val={board[4]}
          isYourTurn={turn === player}
        />
        <Square
          chooseSquare={() => chooseSquare(5)}
          val={board[5]}
          isYourTurn={turn === player}
        />
      </div>
      <div className="flex flex-[33%]">
        <Square
          chooseSquare={() => chooseSquare(6)}
          val={board[6]}
          isYourTurn={turn === player}
        />
        <Square
          chooseSquare={() => chooseSquare(7)}
          val={board[7]}
          isYourTurn={turn === player}
        />
        <Square
          chooseSquare={() => chooseSquare(8)}
          val={board[8]}
          isYourTurn={turn === player}
        />
      </div>
    </div>
  );
};


export default Board;
