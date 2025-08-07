import { useState } from "react";
import NavItem from "../NavItem";
import { IoPersonCircleOutline } from "react-icons/io5";
import BurgerMenu from "../BurgerMenu";
import Dropdown from "../../shared/ui/Dropdown";
import { FaUser } from "react-icons/fa6";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import HeaderSearch from "../search/HeaderSearch";
import { MdPeopleAlt } from "react-icons/md";
import { useAuth } from "@/shared/providers/auth-provider";
import { Link } from "react-router-dom";

const Header = () => {
  const { currentUser, logOut, isAuth } = useAuth();
  const [currentMenu, setCurrentMenu] = useState<string>("");

  return (
    <div
      className="bg-color-neutral-800/80 w-full h-14 fixed left-0 top-0 flex
      items-center justify-center md:px-16 lg:px-32 xl:px-48 z-40
      backdrop-blur-sm select-none"
    >
      <BurgerMenu currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />
      <div className="flex justify-center h-full">
        <div className="hidden md:flex">
          <NavItem
            href="/"
            text="PLAY"
            className="hover:bg-color-accent-400 px-3"
          />
          <NavItem
            href="/learn"
            text="LEARN"
            className="hover:bg-color-accent-400 px-3"
          />
          <NavItem
            href="/about"
            text="ABOUT"
            className="hover:bg-color-accent-400 px-3"
          />
        </div>

        <NavItem
          href="/donate"
          text="DONATE"
          className={`text-color-danger-200 ${
            currentMenu === "search" ? "hidden lg:flex" : ""
          } hover:text-color-danger-100 px-3`}
        />
      </div>

      <div className="ml-auto flex justify-center items-center h-full">
        <HeaderSearch
          className="flex"
          currentMenu={currentMenu}
          setCurrentMenu={setCurrentMenu}
        />
        {isAuth && (
          <Link className="z-50 mr-1.5" to="/friends">
            <MdPeopleAlt className="" href="/friends" size={26} />
          </Link>
        )}
        {isAuth ? (
          <div className="flex justify-center h-full items-center">
            {/*<NavItem href="/friends" text="friends" />*/}
            <Dropdown
              currentMenu={currentMenu}
              setCurrentMenu={setCurrentMenu}
              trigger={
                <div className="flex justify-center items-center gap-1 cursor-pointer h-full">
                  <p className="font-normal truncate max-w-24">
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
          <div className="flex justify-center gap-4 px-3 md:pr-0 z-50">
            <NavItem
              href="/login"
              text="Log In"
              className="text-color-accent-400 hover:text-blue-400 text-lg"
            />
            <NavItem
              href="/signup"
              text="Sign Up"
              className="text-color-neutral-300 hover:text-gray-300 text-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
