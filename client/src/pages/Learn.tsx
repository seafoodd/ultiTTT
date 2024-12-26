import React from 'react';

const Learn = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        How to Play Ultimate Tic Tac Toe
      </h1>
      <p className="mb-4">
        Ultimate Tic Tac Toe is a variation of the classic Tic Tac Toe game, but
        with a twist. Instead of a single 3x3 grid, the game is played on a 3x3
        grid of 3x3 grids. Here are the rules:
      </p>
      <h2 className="text-2xl font-semibold mb-2">Objective</h2>
      <p className="mb-4">
        The objective of the game is to win three local boards in a row, either
        horizontally, vertically, or diagonally.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Gameplay</h2>
      <ol className="list-decimal list-inside mb-4 flex flex-col items-center justify-center">
        <li>
          Players take turns to place their mark (X or O) on an empty cell
          within any of the 3x3 local boards.
        </li>
        <li>
          The position of the mark within the local board determines which local
          board the next player must play in.
        </li>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center w-full my-4">
          <img
            src="/images/learn/learn_1.png"
            alt="image 1"
            className="w-[480px] subpixel-antialiased"
          />
          <img
            src="/images/learn/learn_2.png"
            alt="image 2"
            className="w-[480px] subpixel-antialiased"
          />
        </div>
        <li>
          A player wins a local board by getting three of their marks in a row
        </li>
        <img
          src="/images/learn/learn_3.png"
          alt="subwin image"
          className="w-[480px] subpixel-antialiased"
        />
        <li>
          The game is won by the player who wins three local boards in a row
        </li>
        <img
          src="/images/learn/learn_win.png"
          alt="win image"
          className="w-[480px] subpixel-antialiased"
        />
      </ol>
      <h2 className="text-2xl font-semibold mb-2">Special Cases</h2>
      <ul className="list-disc list-inside mb-4 flex flex-col items-center justify-center">
        <li>
          If a local board results in a draw (no player wins), it is considered
          full and cannot be played in again.
        </li>
        <img
          src="/images/learn/learn_tie.png"
          alt="tie image"
          className="w-[480px] subpixel-antialiased"
        />
        <li>
          If a player is sent to a local board that is already full, they can
          choose any empty cell on any local board.
        </li>
        <img
          src="/images/learn/learn_any.png"
          alt="any cell image"
          className="w-[480px] subpixel-antialiased"
        />
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Strategy</h2>
      <p className="mb-4">
        Ultimate Tic Tac Toe requires players to think ahead and plan their
        moves carefully. Consider both the local and global boards when making a
        move, and try to control the flow of the game by sending your opponent
        to less favorable boards.
      </p>
    </div>
  );
};

export default Learn;