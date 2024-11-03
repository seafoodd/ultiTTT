import React from 'react';
import {NavLink} from "react-router-dom";

interface NavItemProps {
  href: string;
  text?: string;
  icon?: any;
  className?: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({href, text, icon, className, onClick}) => {
  return (
      <NavLink onClick={onClick} to={href} className={`${className ? className : ''}
       transition-colors h-full px-4 flex items-center uppercase font-medium hover:bg-color-1/20`}>
        {icon && icon}
        {text && text}
      </NavLink>
  );
};

export default NavItem;