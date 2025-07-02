import React, {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import LoadingCircle from "@/components/LoadingCircle";
import { cn } from "@/shared/lib/client/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  isLoading?: boolean;
  children?: ReactNode;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  href,
  className,
  icon,
  children,
  disabled,
  isLoading = false,
  ...props
}) => {
  const commonClasses = cn(
    "font-medium flex justify-center items-center gap-1 rounded-md h-fit text-[18px] transition-colors text-nowrap",
    className,
  );

  if (href) {
    return (
      <Link
        className={commonClasses}
        to={href}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {icon}
        {isLoading ? <LoadingCircle /> : children}
      </Link>
    );
  }

  return (
    <button
      className={commonClasses}
      onClick={isLoading || !onClick ? undefined : onClick}
      disabled={isLoading || disabled}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon}
      {isLoading ? <LoadingCircle /> : children}
    </button>
  );
};

export default Button;
