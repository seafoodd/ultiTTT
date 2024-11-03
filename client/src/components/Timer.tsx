import React from "react";

const formatTime = (seconds: number) => {
  const minutes = Math.trunc(seconds / 60);
  const secondsLeft = seconds % 60;
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
};

interface TimerProps {
  seconds: number;
  isCompact?: boolean;
}

const Timer: React.FC<TimerProps> = ({ seconds, isCompact }) => {
  if (isCompact) {
    return (
      <div
        className="flex lg:hidden h-8 bg-color-1/20
       justify-center items-center text-2xl font-semibold p-4"
      >
        {formatTime(seconds)}
      </div>
    );
  }

  return (
    <div
      className="hidden lg:flex h-8 bg-gray-800
       justify-center items-center text-2xl font-semibold p-4"
    >
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;
