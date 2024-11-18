import React from "react";
import JoinGame from "../components/JoinGame";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Welcome from "../components/Welcome";
import { Socket } from "socket.io-client";

interface HomeProps {
  socket: Socket;
}

const Home: React.FC<HomeProps> = ({ socket }) => {
  const { isAuth } = useAuth();
  useNavigate();
  return (
    <>
      {isAuth ? (
        <div className="flex flex-col gap-8 w-full items-center">
          <JoinGame socket={socket} />
        </div>
      ) : (
        <Welcome />
      )}
    </>
  );
};

export default Home;
