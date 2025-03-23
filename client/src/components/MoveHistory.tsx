import React, { useRef, useEffect } from "react";

const MoveHistory: React.FC<{
  moveHistory: { subBoardIndex: number; squareIndex: number; player: string }[];
  currentMoveIndex: number;
  setCurrentMoveIndex: any;
}> = ({ moveHistory, currentMoveIndex, setCurrentMoveIndex }) => {
  const moveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && currentMoveIndex === 0) {
      containerRef.current.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else if (moveRefs.current[currentMoveIndex - 1]) {
      const moveRef = moveRefs.current[currentMoveIndex - 1];
      if (moveRef) {
        moveRef.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [currentMoveIndex]);

  return (
    <div
      ref={containerRef}
      className="flex lg:max-w-[640px]
      flex-row lg:flex-col max-h-fit
      lg:overflow-x-hidden lg:w-80 overflow-x-scroll border-t border-color-accent-100/20"
    >
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
            <div
              className="flex items-center justify-center border-r border-l lg:border-l-0
             border-color-accent-100/20 bg-white/5 text-white/40 min-w-12 h-8"
            >
              {pairIndex + 1}
            </div>
            <div className="flex flex-row bg-color-neutral-800 w-full justify-start h-8">
              {movePair.map((move, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    moveRefs.current[pairIndex * 2 + index] = el;
                  }}
                  className={`flex flex-1 max-w-[120px] justify-between cursor-pointer
                pr-8 lg:pr-12 hover:bg-color-accent-300/10 items-center text-[16px]
                ${move.player === "X" ? "text-color-symbols-x" : "text-color-symbols-o"}
                ${
                  pairIndex * 2 + index + 1 === currentMoveIndex
                    ? "bg-color-accent-300/25 font-bold"
                    : "font-medium"
                }`}
                  onClick={() => setCurrentMoveIndex(pairIndex * 2 + index + 1)}
                >
                  <div className="w-8">
                    {move.subBoardIndex + 1}-{move.squareIndex + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MoveHistory;
