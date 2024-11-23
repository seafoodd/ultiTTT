import "./App.css";
import {Outlet, useLocation} from "react-router-dom";
import Header from "./components/Header";
import Notification from "./components/Notification";
import {Socket} from "socket.io-client";
import React, {useEffect} from "react";

interface AppProps {
  socket: Socket;
}

const App: React.FC<AppProps> = ({socket}) => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "ultiTTT"; // Default title

    switch (path) {
      case "/home":
        title = "Home - ultiTTT";
        break;
      case "/about":
        title = "About - ultiTTT";
        break;
      case "/blog":
        title = "Blog - ultiTTT";
        break;
      case "/rules":
        title = "Rules - ultiTTT";
        break;
      case "/donate":
        title = "Donate - ultiTTT";
        break;
      case "/friends":
        title = "Friends - ultiTTT";
        break;
      case "/login":
        title = "Log In - ultiTTT";
        break;
      case "/signup":
        title = "Sign Up - ultiTTT";
        break;
      case "/settings":
        title = "Settings - ultiTTT";
        break;
      default:
        if (path.startsWith("/@/")) {
          title = "Profile - ultiTTT";
        } else if (path.startsWith("/")) {
          title = "Game - ultiTTT";
        }
        break;
    }

    document.title = title;
  }, [location]);

  return (
    <>
      <Header socket={socket} />
      <div className="w-full h-full mt-12 flex justify-center items-center gap-24">
        <Outlet />
        <Notification socket={socket}/>
      </div>
      {/*<div className='h-[3000px] w-full bg-color-1/5'></div>*/}
    </>
  );
};

export default App;
