import React from "react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  href: string;
  text?: string;
  icon?: any;
  className?: string;
  onClick?: () => void;
  flipped?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  text,
  icon,
  className,
  onClick,
  flipped,
}) => {
  return (
    <NavLink
      onClick={onClick}
      to={href}
      className={`${className ? className : ""}
       ${flipped ? "flex-row-reverse" : "flex-row"} gap-1 transition-colors flex items-center font-medium`}
    >
      {icon && icon}
      {text && text}
    </NavLink>
  );
};

export default NavItem;
