import React from "react";
import { IoMenu } from "react-icons/io5";
import NavItem from "./NavItem";

interface BurgerMenuProps {
  currentMenu: string;
  setCurrentMenu: React.Dispatch<string>;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({
  currentMenu,
  setCurrentMenu,
}) => {
  const toggleMenu = () => {
    if (currentMenu === "burger") {
      setCurrentMenu("");
      return;
    }
    setCurrentMenu("burger");
  };

  return (
    <button
      className={`flex md:hidden px-3 justify-center items-center h-full w-16
       transition-colors ${currentMenu === "burger" ? "bg-color-gray-2/100" : ""}`}
      onClick={toggleMenu}
    >
      <IoMenu size={40} />
      <div
        className={`${currentMenu === "burger" ? "scale-x-100" : "scale-x-0"} h-fit transform
        transition-transform origin-left absolute top-16 left-0 w-[75%] sm:w-[60%]
        bg-color-gray-2/80 shadow-md backdrop-blur-sm z-10`}
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
