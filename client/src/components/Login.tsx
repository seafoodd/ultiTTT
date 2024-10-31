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
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const logIn = () => {
    Axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      username,
      password,
      rememberMe,
    }).then((res) => {
      const { token } = res.data;
      cookies.set("token", token);
      // cookies.set("userId", userId);
      // cookies.set("username", username);
      setIsAuth(true);
    });
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleRememberMeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
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
      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={handleRememberMeChange}
        />
        Remember Me
      </label>
      <button onClick={logIn}>Login</button>
    </div>
  );
};

export default Login;