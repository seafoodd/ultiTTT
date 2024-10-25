import "./App.css";
import SignUp from "./components/SignUp.jsx";
import Login from "./components/Login.jsx";
import Cookies from "universal-cookie";
import { useEffect, useState } from "react";
import JoinGame from "./components/JoinGame.jsx";

function App() {
  const cookies = new Cookies();

  const token = cookies.get("token");

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (token) {
      setIsAuth(true);
    }
  }, [token]);

  const logOut = () => {
    cookies.remove("token");
    cookies.remove("userId");
    cookies.remove("username");
    cookies.remove("hashedPassword");
    // socket.disconnect();
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
