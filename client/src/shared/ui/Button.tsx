import React from "react";
import LoadingCircle from "@/components/LoadingCircle";
import { cn } from "@/shared/lib/client/cn";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  disabled,
  asChild = false,
  isLoading = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";

  const commonClasses = cn(
    "font-medium flex justify-center items-center gap-1 rounded-md h-fit text-[18px] transition-colors text-nowrap",
    className
  );

  return (
    <Comp
      className={commonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <LoadingCircle /> : children}
    </Comp>
  );
};

export default Button;
