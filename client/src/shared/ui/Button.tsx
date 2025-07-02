import React, { ButtonHTMLAttributes, ReactNode } from "react";
import LoadingCircle from "../../components/LoadingCircle";
import { cn } from "../lib/client/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  className,
  icon,
  children,
  disabled,
  isLoading = false,
  ...props
}) => {
  if (onClick) {
    return (
      <button
        className={cn(
          "font-medium flex justify-center items-center gap-1 rounded-md h-fit text-[18px] transition-colors text-nowrap",
          className
        )}
        onClick={isLoading ? undefined : onClick}
        disabled={isLoading || disabled}
        {...props}
      >
        {icon}
        {isLoading ? <LoadingCircle /> : children}
      </button>
    );
  }
};

export default Button;
