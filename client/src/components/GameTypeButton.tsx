import React, { MouseEventHandler } from 'react';

interface GameTypeButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  typeText: string;
  timeText: string;
}

const GameTypeButton: React.FC<GameTypeButtonProps> = ({ onClick, typeText, timeText }) => {
  return (
    <button
      className="group border-2 box-border w-full h-[120px] sm:w-[200px] bg-color-neutral-800 hover:bg-color-accent-300 border-color-accent-300 transition-colors flex items-center justify-center rounded-md"
      onClick={onClick}
    >
      <div className="font-normal mt-2">
        <div className="text-[32px] mb-1 group-hover:text-white transition-colors">{timeText}</div>
        <div className="text-2xl text-color-neutral-300 group-hover:text-white transition-colors">{typeText}</div>
      </div>
    </button>
  );
};

export default GameTypeButton;