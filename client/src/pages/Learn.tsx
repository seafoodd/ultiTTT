import { useClientSeo } from "@/shared/hooks/use-client-seo";

const Learn = () => {

  useClientSeo({
    title: "Learn - ultiTTT"
  })

  return (
    <div className="flex flex-col p-8 max-w-full font-medium text-lg justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">
        How to Play Ultimate Tic-Tac-Toe
      </h1>
      <p className="mb-8 text-lg max-w-[800px]">
        Ultimate Tic-Tac-Toe is a variation of the classic Tic-Tac-Toe game, but
        with a twist. Instead of a single 3x3 grid, the game is played on a 3x3
        grid of 3x3 grids. Here are the rules:
      </p>
      <h2 className="text-2xl font-semibold mb-3">Objective</h2>
      <p className="mb-8 text-lg">
        The objective of the game is to win three local boards in a row, either
        horizontally, vertically, or diagonally.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Gameplay</h2>
      <div className="mb-4 flex flex-wrap w-full max-w-[1280px] justify-center gap-x-16 items-center">
        <div className="flex flex-col items-center justify-center w-[480px] mb-8">
          <p className="mb-4">
            <b>1.</b> Players take turns to place their mark (X or O) on an empty cell
            within any of the 3x3 local boards.
          </p>
          <img
            src="/images/learn/learn_1.png"
            alt="image 1"
            className="w-[480px] subpixel-antialiased rounded-md"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-[480px] mb-8">
          <p className="mb-4">
            <b>2.</b> The position of the mark within the local board determines which
            local board the next player must play in.
          </p>
          <img
            src="/images/learn/learn_2.png"
            alt="image 2"
            className="w-[480px] subpixel-antialiased rounded-md"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-[480px] mb-8">
          <p className="mb-4">
            <b>3.</b> A player wins a local board by getting three of their marks in a
            row
          </p>
          <img
            src="/images/learn/learn_3.png"
            alt="subwin image"
            className="w-[480px] subpixel-antialiased rounded-md"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-[480px] mb-8">
          <p className="mb-4">
            <b>4.</b> The game is won by the player who wins three local boards in a
            row
          </p>
          <img
            src="/images/learn/learn_win.png"
            alt="win image"
            className="w-[480px] subpixel-antialiased rounded-md"
          />
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Special Cases</h2>
      <div className="mb-4 flex flex-wrap w-full max-w-[1280px] justify-center gap-x-16 items-center">
        <div className="flex flex-col items-center justify-center w-[480px] mb-8">
          <p className="mb-4">
            <b>1.</b> If a local board results in a draw (no player wins), it is
            considered full and cannot be played in again.
          </p>
          <img
            src="/images/learn/learn_tie.png"
            alt="tie image"
            className="w-[480px] subpixel-antialiased rounded-md"
          />
        </div>
        <div className="flex flex-col items-center justify-center w-[480px] mb-8">
          <p className="mb-4">
            <b>2.</b> If a player is sent to a local board that is already full, they
            can choose any empty cell on any local board.
          </p>
          <img
            src="/images/learn/learn_any.png"
            alt="any cell image"
            className="w-[480px] subpixel-antialiased rounded-md"
          />
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Strategy</h2>
      <p className="mb-24 text-lg max-w-[800px]">
        Ultimate Tic-Tac-Toe requires players to think ahead and plan their
        moves carefully. Consider both the local and global boards when making a
        move, and try to control the flow of the game by sending your opponent
        to less favorable boards.
      </p>
    </div>
  );
};

export default Learn;
