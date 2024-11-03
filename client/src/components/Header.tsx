import React, { useState } from "react";
import NavItem from "./NavItem";
import {IoMenu} from "react-icons/io5";
import {IoPersonCircleOutline} from "react-icons/io5";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-color-3/20 w-full h-16 sticky left-0 top-0 flex items-center justify-between gap-16 md:px-24 z-20">
      <button className="block md:hidden p-2" onClick={toggleMenu}>
        <IoMenu size={40} />
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-color-3/40 shadow-md z-10">
            <NavItem
              href="/home"
              text="home"
              className="py-6 hover:bg-white/30"
              onClick={toggleMenu}
            />
            <NavItem
              href="/blog"
              text="blog"
              className="py-6 hover:bg-white/30"
              onClick={toggleMenu}
            />
            <NavItem
              href="/rules"
              text="rules"
              className="py-6 hover:bg-white/30"
              onClick={toggleMenu}
            />
            <NavItem
              href="/donate"
              text="donate"
              className="text-yellow-500 py-6 hover:bg-white/30"
              onClick={toggleMenu}
            />
          </div>
        )}
      </button>
      <div className="hidden md:flex justify-center gap-4 h-full">
        <NavItem href="/home" text="home" />
        <NavItem href="/blog" text="blog" />
        <NavItem href="/rules" text="rules" />
        <NavItem href="/donate" text="donate" className="text-yellow-500" />
      </div>
      <div className="flex justify-center h-full">
        {/*<NavItem href="/friends" text="friends" />*/}
        <NavItem href="/@/seafood" icon={<IoPersonCircleOutline size={40}/>} />
      </div>
    </div>
  );
};

export default Header;