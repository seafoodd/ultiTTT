import { useState, ChangeEvent } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";

interface SignUpProps {
  setIsAuth: (isAuth: boolean) => void;
}

interface User {
  username: string;
  password: string;
}

const SignUp: React.FC<SignUpProps> = ({ setIsAuth }) => {
  const cookies = new Cookies();
  const [user, setUser] = useState<User>({ username: "", password: "" });

  const signUp = () => {
    Axios.post(`${import.meta.env.VITE_API_URL}/signup`, user).then((res) => {
      const { token, userId, username, hashedPassword } = res.data;

      cookies.set("token", token);
      cookies.set("userId", userId);
      cookies.set("username", username);
      cookies.set("hashedPassword", hashedPassword);
      setIsAuth(true);
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      <label>Sign Up</label>
      <input
        name="username"
        placeholder="Username"
        onChange={handleInputChange}
        required
      />
      <input
        name="password"
        placeholder="Password"
        type="password"
        onChange={handleInputChange}
        required
      />
      <button onClick={signUp}>Sign Up</button>
    </div>
  );
};

export default SignUp;