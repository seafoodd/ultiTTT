import React from "react";
import LoadingCircle from "./LoadingCircle";

interface ButtonProps {
  onClick: () => void;
  className?: string;
  text?: string;
  icon?: any;
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  className,
  text,
  icon,
  disabled,
  loading = false,
}) => {
  return (
    <button
      className={`${className ? className : ""} font-medium flex justify-center 
      items-center gap-1 rounded-md h-fit text-xl shadow-md text-white transition-colors text-nowrap`}
      onClick={loading ? undefined : onClick}
      disabled={loading || disabled}
    >
      {icon && <div className="h-full">{icon}</div>}
      {loading ? (
        <LoadingCircle />
      ) : (
        text && <div className="h-full">{text}</div>
      )}
    </button>
  );
};

export default Button;
