import React, { useState } from "react";
import NavItem from "./NavItem";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import BurgerMenu from "./BurgerMenu";
import Dropdown from "./Dropdown";
import { FaUser } from "react-icons/fa6";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import HeaderSearch from "./HeaderSearch";
import { MdPeopleAlt } from "react-icons/md";

const Header = () => {
  const { currentUser, logOut, isAuth } = useAuth();
  const [currentMenu, setCurrentMenu] = useState<string>("");

  return (
    <div
      className="bg-color-gray-1 w-full h-16 fixed left-0 top-0 flex
      items-center justify-center md:px-16 lg:px-32 xl:px-48 z-40
      backdrop-blur-sm select-none"
    >
      <BurgerMenu currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />
      <div className="flex justify-center h-full">
        <div className="hidden md:flex">
          <NavItem
            href="/home"
            text="PLAY"
            className="hover:bg-color-blue-2/80 px-4"
          />
          <NavItem
            href="/learn"
            text="LEARN"
            className="hover:bg-color-blue-2/80 px-4"
          />
          <NavItem
            href="/about"
            text="ABOUT"
            className="hover:bg-color-blue-2/80 px-4"
          />
        </div>

        <NavItem
          href="/donate"
          text="DONATE"
          className={`text-yellow-500 ${currentMenu === "search" ? "hidden lg:flex" : ""} hover:text-yellow-100 px-4`}
        />
      </div>

      <div className="ml-auto flex justify-center items-center h-full">
        <HeaderSearch
          className="flex"
          currentMenu={currentMenu}
          setCurrentMenu={setCurrentMenu}
        />
        {isAuth && (
          <a className="z-50 mr-1" href="/friends">
            <MdPeopleAlt className="-mb-1" href="/friends" size={22} />
          </a>
        )}
        {isAuth ? (
          <div className="flex justify-center h-full items-center">
            {/*<NavItem href="/friends" text="friends" />*/}
            <Dropdown
              currentMenu={currentMenu}
              setCurrentMenu={setCurrentMenu}
              trigger={
                <div className="flex justify-center items-center gap-1 cursor-pointer h-full">
                  <p className="font-medium truncate max-w-24">
                    {currentUser?.username}
                  </p>
                  <IoPersonCircleOutline size={32} />
                </div>
              }
              options={[
                {
                  name: "Profile",
                  icon: <FaUser />,
                  href: `/@/${currentUser?.username}`,
                },
                {
                  name: "Settings",
                  icon: <FaCog />,
                  href: "/settings",
                },
                {
                  name: "Log Out",
                  icon: <FaSignOutAlt />,
                  onClick: () => {
                    logOut();
                  },
                },
              ]}
            />
          </div>
        ) : (
          <div className="flex justify-center gap-4 pr-4 md:pr-0 z-50">
            <NavItem
              href="/login"
              text="Log In"
              className="text-blue-500 hover:text-blue-400 text-lg"
            />
            <NavItem
              href="/signup"
              text="Sign Up"
              className="text-gray-400 hover:text-gray-300 text-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
