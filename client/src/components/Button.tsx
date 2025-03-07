import React from "react";
import LoadingCircle from "./LoadingCircle";

interface ButtonProps {
  onClick?: () => void;
  href?: string;
  className?: string;
  text?: string;
  title?: string;
  icon?: any;
  disabled?: boolean;
  loading?: boolean;
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
      <a
        className={`${className ? className : ""} font-medium flex justify-center 
      items-center gap-1 rounded-md h-fit text-[18px] text-white transition-colors text-nowrap`}
        href={href}
        title={title}
      >
        {icon && <div className="h-full">{icon}</div>}
        {loading ? (
          <LoadingCircle />
        ) : (
          text && <div className="h-full">{text}</div>
        )}
      </a>
    );
  }

  return;
};

export default Button;
