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
      items-center gap-2 rounded-md h-fit py-4 text-xl shadow-md transition-colors`}
      onClick={onClick}
    >
      {text && text}
      {icon && icon}
    </button>
  );
};

export default Button;
