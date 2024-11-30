import React from "react";
import JoinGame from "../components/JoinGame";
import { useAuth } from "../context/AuthContext";
import Welcome from "../components/Welcome";
import LoadingCircle from "../components/LoadingCircle";



const Home = () => {
  const { authLoading, isAuth } = useAuth();
  return (
    <>
      {isAuth ? (
        <div className="flex flex-col gap-8 w-full items-center">
          <JoinGame />
        </div>
      ) : authLoading ? (
        <LoadingCircle />
      ) : (
        <Welcome />
      )}
    </>
  );
};

export default Home;
