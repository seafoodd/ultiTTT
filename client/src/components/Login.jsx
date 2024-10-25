import { useState } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";

const Login = ({ setIsAuth }) => {
  const cookies = new Cookies();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const logIn = () => {
    Axios.post(`${import.meta.env.VITE_API_URL}/login`, {
      username,
      password,
    }).then((res) => {
      const { token, userId, username } = res.data;
      cookies.set("token", token);
      cookies.set("userId", userId);
      cookies.set("username", username);
      setIsAuth(true);
    });
  };

  return (
    <div className="flex flex-col gap-4 ">
      <label>Login</label>
      <input
        placeholder="Username"
        onChange={(event) => setUsername(event.target.value)}
        required
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button onClick={logIn}>Login</button>
    </div>
  );
};

export default Login;
