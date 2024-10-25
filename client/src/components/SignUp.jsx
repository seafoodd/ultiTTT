import { useState } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";

const SignUp = ({ setIsAuth }) => {
  const cookies = new Cookies();
  const [user, setUser] = useState(null);

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

  return (
    <div className="flex flex-col gap-4">
      <label>Sign Up</label>
      <input
        placeholder="Username"
        onChange={(event) => setUser({ ...user, username: event.target.value })}
        required
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(event) => setUser({ ...user, password: event.target.value })}
        required
      />
      <button onClick={signUp}>Sign Up</button>
    </div>
  );
};

export default SignUp;
