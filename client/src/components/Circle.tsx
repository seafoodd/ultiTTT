import React from "react";

interface CircleProps {
  size?: number;
  transparent?: boolean;
  className?: string;
}

const Circle: React.FC<CircleProps> = ({ size, transparent, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="42"
        className={`${className} ${transparent ? "stroke-white/20" : "stroke-color-symbols-o"}`}
        strokeWidth="12"
        fill="none"
      />
    </svg>
  );
};

export default Circle;
