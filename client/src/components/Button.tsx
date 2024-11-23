import React from "react";

interface ButtonProps {
  onClick: () => void;
  className?: string;
  text?: string;
  icon?: any;
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ onClick, className, text, icon, disabled }) => {
  return (
    <button
      className={`${className ? className : ""} font-semibold flex justify-center 
      items-center gap-1 rounded-md h-fit text-xl shadow-md transition-colors text-nowrap`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && icon}
      {text && text}
    </button>
  );
};

export default Button;
