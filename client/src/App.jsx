import "./App.css";
import SignUp from "./components/SignUp.jsx";
import Login from "./components/Login.jsx";
import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import JoinGame from "./components/JoinGame.jsx";
import axios from "axios";

function App() {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/verifyToken`, {
          headers: {
            Authorization: token,
          },
        });
        if (response.status === 200) {
          setIsAuth(true);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsAuth(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const logOut = () => {
    cookies.remove("token");
    cookies.remove("userId");
    cookies.remove("username");
    cookies.remove("hashedPassword");
    setIsAuth(false);
  };

  return (
    <>
      <div className="mt-36 flex justify-center items-center gap-24">
        {isAuth ? (
          <div className="flex flex-col gap-16">
            <JoinGame />
            <button onClick={logOut}>Log Out</button>
          </div>
        ) : (
          <>
            <SignUp setIsAuth={setIsAuth} />
            <Login setIsAuth={setIsAuth} />
          </>
        )}
      </div>
    </>
  );
}

export default App;
