import React from "react";

interface ButtonProps {
  onClick: () => void;
  className?: string;
  text?: string;
  icon?: any;
}

const Button: React.FC<ButtonProps> = ({ onClick, className, text, icon }) => {
  return (
    <button
      className={`${className ? className : ""} font-semibold flex justify-center 
      items-center gap-1 rounded-md h-fit text-xl shadow-md transition-colors text-nowrap`}
      onClick={onClick}
    >
      {icon && icon}
      {text && text}
    </button>
  );
};

export default Button;
