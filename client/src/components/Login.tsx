import { useState, ChangeEvent } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";

interface LoginProps {
  setIsAuth: (isAuth: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuth }) => {
  const cookies = new Cookies();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4">
      <label>Login</label>
      <input
        placeholder="Username"
        onChange={handleUsernameChange}
        required
      />
      <input
        placeholder="Password"
        type="password"
        onChange={handlePasswordChange}
        required
      />
      <button onClick={logIn}>Login</button>
    </div>
  );
};

export default Login;