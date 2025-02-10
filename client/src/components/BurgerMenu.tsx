import React from "react";
import { IoMenu } from "react-icons/io5";
import NavItem from "./NavItem";

interface BurgerMenuProps {
  currentMenu: string;
  setCurrentMenu: React.Dispatch<React.SetStateAction<string>>;
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
       transition-colors ${currentMenu === "burger" ? "bg-color-neutral-1000" : ""}`}
      onClick={toggleMenu}
    >
      <IoMenu size={40} />
      <div
        className={`${currentMenu === "burger" ? "scale-x-100" : "scale-x-0"} h-fit transform
        transition-transform origin-left absolute top-14 left-0 w-[75%] sm:w-[60%]
        bg-color-neutral-1000/80 shadow-md backdrop-blur-sm z-10`}
      >
        <NavItem
          href="/"
          text="PLAY"
          className="py-6 pl-20"
          onClick={toggleMenu}
        />
        <NavItem
          href="/learn"
          text="LEARN"
          className="py-6 pl-20"
          onClick={toggleMenu}
        />
        <NavItem
          href="/about"
          text="ABOUT"
          className="py-6 pl-20"
          onClick={toggleMenu}
        />
      </div>
    </button>
  );
};

export default BurgerMenu;
