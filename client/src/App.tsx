import "./App.css";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Notification from "./components/Notification";
import {Socket} from "socket.io-client";
import React from "react";

interface AppProps {
  socket: Socket;
}

const App: React.FC<AppProps> = ({socket}) => {
  return (
    <>
      <Header />
      <div className="w-full h-full mt-12 flex justify-center items-center gap-24">
        <Outlet />
        <Notification socket={socket}/>
      </div>
      {/*<div className='h-[3000px] w-full bg-color-1/5'></div>*/}
    </>
  );
};

export default App;
