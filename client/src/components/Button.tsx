import React from "react";
import LoadingCircle from "./LoadingCircle";
import { Link } from "react-router-dom";

interface ButtonProps {
  onClick?: () => void;
  href?: string;
  className?: string;
  text?: string;
  title?: string;
  icon?: any;
  disabled?: boolean;
  loading?: boolean;
  type?: "submit" | "reset" | "button";
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  href,
  className,
  text,
  icon,
  title = undefined,
  disabled,
  loading = false,
  type = undefined,
}) => {
  if (onClick) {
    return (
      <button
        className={` ${className ? className : ""} font-medium flex justify-center 
      items-center gap-1 rounded-md h-fit text-[18px] transition-colors text-nowrap`}
        onClick={loading ? undefined : onClick}
        disabled={loading || disabled}
        title={title}
      >
        {icon && <div className="h-full">{icon}</div>}
        {loading ? (
          <LoadingCircle />
        ) : (
          text && <div className="h-full">{text}</div>
        )}
      </button>
    );
  }
  if (href) {
    return (
      <Link
        className={`${className ? className : ""} font-medium flex justify-center 
      items-center gap-1 rounded-md h-fit text-[18px] text-white transition-colors text-nowrap`}
        to={href}
        title={title}
      >
        {icon && <div className="h-full">{icon}</div>}
        {loading ? (
          <LoadingCircle />
        ) : (
          text && <div className="h-full">{text}</div>
        )}
      </Link>
    );
  }

  if (type) {
    return (
      <button
        className={` ${className ? className : ""} font-medium flex justify-center 
      items-center gap-1 rounded-md h-fit text-[18px] transition-colors text-nowrap`}
        disabled={loading || disabled}
        title={title}
        type={type}
      >
        {icon && <div className="h-full">{icon}</div>}
        {loading ? (
          <LoadingCircle />
        ) : (
          text && <div className="h-full">{text}</div>
        )}
      </button>
    );
  }

  return;
};

export default Button;
