import NavItem from "./NavItem";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import BurgerMenu from "./BurgerMenu";

const Header = () => {
  const { currentUser, logOut, isAuth } = useAuth();

  return (
    <div
      className="bg-color-gray-1/80 w-full h-16 sticky left-0 top-0 flex
      items-center justify-center pr-4 md:px-16 lg:px-32 xl:px-48 z-50
      backdrop-blur-sm"
    >
      <BurgerMenu />
      <div className="flex justify-center h-full">
        <div className="hidden md:flex">
          <NavItem
            href="/home"
            text="HOME"
            className="hover:bg-color-blue-1/20 px-4"
          />
          <NavItem
            href="/blog"
            text="BLOG"
            className="hover:bg-color-blue-1/20 px-4"
          />
          <NavItem
            href="/rules"
            text="RULES"
            className="hover:bg-color-blue-1/20 px-4"
          />
        </div>
        <NavItem
          href="/donate"
          text="DONATE"
          className="text-yellow-500 hover:text-yellow-100 px-4"
        />
      </div>
      {isAuth ? (
        <div className="flex justify-center h-full items-center ml-auto">
          {/*<NavItem href="/friends" text="friends" />*/}
          <NavItem
            href={`/@/${currentUser?.username}`}
            text={currentUser?.username}
            icon={<IoPersonCircleOutline size={32} />}
            flipped
          />
          {/*<button onClick={logOut} className="h-8">*/}
          {/*  Log Out*/}
          {/*</button>*/}
        </div>
      ) : (
        <div className="flex justify-center gap-4 ml-auto">
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
  );
};

export default Header;
