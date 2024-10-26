import React from "react";

interface CrossProps {
  size: number;
  transparent?: boolean;
}

const Cross: React.FC<CrossProps> = ({ size, transparent }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={transparent ? "fill-white/[20%]" : "fill-color-1"}
        d="M49 39q1 1 2 0L87 3a1 1 0 0110 10L61 49q-1 1 0 2l36 36a1 1 0 01-10 10L51 61q-1-1-2 0L13 97A1 1 0 013 87l36-36q1-1 0-2L3 13A1 1 0 0113 3z"
      />
    </svg>
  );
};

export default Cross;
