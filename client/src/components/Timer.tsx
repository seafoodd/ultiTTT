import React from "react";

const formatTime = (seconds: number) => {
  const minutes = Math.trunc(seconds / 60);
  const secondsLeft = seconds % 60;
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
};

interface TimerProps {
  ms: number;
  isCompact?: boolean;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ ms, isCompact, className }) => {
  const seconds = Math.ceil(ms / 1000)
  if (isCompact) {
    return (
      <div
        className={`${className ? className : ""} flex lg:hidden h-8 bg-color-gray-3/40
       justify-center items-center text-2xl font-semibold p-4 rounded-sm w-20`}
      >
        {formatTime(seconds)}
      </div>
    );
  }

  return (
    <div
      className={`${className ? className : ""} hidden lg:flex h-12 bg-gray-800
       justify-center items-center text-3xl font-semibold p-4`}
    >
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;
