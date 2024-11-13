import React from "react";
import JoinGame from "../components/JoinGame";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Home = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {isAuth ? (
        <div className="flex flex-col gap-8 w-full items-center">
          <JoinGame />
        </div>
      ) : (
        <div className="flex flex-col justify-center mt-24">
          <h1 className="text-3xl font-medium">
            Sign Up or Log In to Play
            <br />
            <span className="text-amber-400 font-semibold">
              Ultimate Tic-Tac-Toe
            </span>
            <br />
            Now!
          </h1>
          <div className="mt-16 flex gap-8 flex-col md:flex-row justify-center items-center">
            <Button
              onClick={() => navigate("/login")}
              text="Log In"
              className="bg-blue-600 hover:bg-blue-500 w-48"
            />
            <Button
              onClick={() => navigate("/signup")}
              text="Sign Up"
              className="bg-gray-600 hover:bg-gray-500 w-48"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
