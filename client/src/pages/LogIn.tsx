import React, { ChangeEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Cookies from "universal-cookie";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const { setIsAuth } = useAuth();
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const logIn = (event: React.FormEvent) => {
    event.preventDefault();
    Axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      identifier,
      password,
      rememberMe,
    }).then((res) => {
      const { token } = res.data;
      cookies.set("token", token, { path: "/" });
      // cookies.set("username", username);
      setIsAuth(true);
      navigate("/home");
      location.reload();
    });
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIdentifier(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleRememberMeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
  };
  return (
    <div
      className="flex flex-col bg-color-gray-1 p-8 rounded-md
      justify-center mt-24"
    >
      <h1 className="flex justify-center text-white/90 text-3xl font-medium">
        Log in
      </h1>
      <form className="mt-12 flex flex-col gap-4 w-72">
        <input
          className="px-2 py-1 rounded-md"
          placeholder="Username or email"
          onChange={handleUsernameChange}
          required
        />
        <input
          className="px-2 py-1 rounded-md"
          placeholder="Password"
          type="password"
          onChange={handlePasswordChange}
          required
        />
        <div className="flex justify-between">
          <label className="text-[14px] cursor-pointer font-medium text-white/90 gap-1 flex items-center justify-center">
            <input
              className="cursor-pointer"
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            Remember Me
          </label>
          <button
            className="text-[14px] underline font-medium text-white/80 transition-colors hover:text-white"
            onClick={logIn}
          >
            Forgot password?
          </button>
        </div>
        <button
          className="mt-8 font-semibold flex justify-center items-center bg-blue-600 rounded-md px-12 w-full py-2"
          onClick={logIn}
        >
          Log in
        </button>
        <button
          className="text-[14px] font-medium text-white/70 transition-colors hover:text-white/80"
          onClick={() => navigate("/signup")}
        >
          Don't have an account?{" "}
          <span className="text-white/80 font-semibold">Sign Up</span>
        </button>
      </form>
    </div>
  );
};

export default LogIn;
