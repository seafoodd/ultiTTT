import React from "react";
import JoinGame from "../components/JoinGame";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Welcome from "../components/Welcome";

const Home = () => {
  const { isAuth } = useAuth();
  useNavigate();
  return (
    <>
      {isAuth ? (
        <div className="flex flex-col gap-8 w-full items-center">
          <JoinGame />
        </div>
      ) : (
        <Welcome/>
      )}
    </>
  );
};

export default Home;
