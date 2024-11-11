import React from 'react';
import JoinGame from "../components/JoinGame";
import SignUp from "../components/SignUp";
import Login from "../components/Login";
import {useAuth} from "../context/AuthContext";

const Home = () => {
  const { isAuth, token, setIsAuth } = useAuth();
  console.log(isAuth, token)

  return (
    <>
      {isAuth ? (
        <div className="flex flex-col gap-8 w-full items-center">
          <JoinGame />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-16 lg:gap-32 justify-center mt-16 lg:mt-64">
          <SignUp setIsAuth={setIsAuth} />
          <Login setIsAuth={setIsAuth} />
        </div>
      )}
    </>
  );
};

export default Home;