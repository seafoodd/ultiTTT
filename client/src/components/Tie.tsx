import React from "react";

interface TieProps {
  size: number;
}

const Tie: React.FC<TieProps> = ({ size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="flex items-center"
    >
      <path
        className='fill-white/20'
        d="M0 2q0-2 2-2h196q2 0 2 2v16q0 2-2 2H2q-2 0-2-2zm0 40q0-2 2-2h196q2 0 2 2v16q0 2-2 2H2q-2 0-2-2z"
        transform="translate(0, 20)"
      />
    </svg>
  );
};

export default Tie;