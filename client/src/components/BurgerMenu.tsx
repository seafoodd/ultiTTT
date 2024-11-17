import React, {useState} from 'react';
import {IoMenu} from "react-icons/io5";
import NavItem from "./NavItem";

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      className={`flex md:hidden px-3 justify-center items-center h-full w-16
       transition-colors ${isOpen ? "bg-color-gray-2/100" : ""}`}
      onClick={toggleMenu}
    >
      <IoMenu size={40} />
      <div
        className={`${isOpen ? "scale-x-100" : "scale-x-0"} h-fit transform
        transition-transform origin-left absolute top-16 left-0 w-[75%]
        bg-color-gray-2/80 box-content shadow-md backdrop-blur-sm z-10`}
      >
        <NavItem
          href="/home"
          text="HOME"
          className="py-6 pl-20"
          onClick={toggleMenu}
        />
        <NavItem
          href="/blog"
          text="BLOG"
          className="py-6 pl-20"
          onClick={toggleMenu}
        />
        <NavItem
          href="/rules"
          text="RULES"
          className="py-6 pl-20"
          onClick={toggleMenu}
        />
      </div>
    </button>
  );
};

export default BurgerMenu;