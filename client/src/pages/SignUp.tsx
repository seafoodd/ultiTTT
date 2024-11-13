import React, { ChangeEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Cookies from "universal-cookie";
import Axios from "axios";
import {useNavigate} from "react-router-dom";

interface User {
  username: string;
  password: string;
  email: string;
}

const LogIn = () => {
  const { setIsAuth } = useAuth();
  const cookies = new Cookies();
  const navigate = useNavigate()

  const [user, setUser] = useState<User>({
    email: "",
    username: "",
    password: "",
  });

  const signUp = (event: React.FormEvent) => {
    event.preventDefault();
    Axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, user).then(
      (res) => {
        const { token } = res.data;

        cookies.set("token", token);
        // cookies.set("userId", userId);
        // cookies.set("username", username);
        // cookies.set("password", password);
        setIsAuth(true);
        navigate("/home")
      },
    );
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };
  return (
    <div
      className="flex flex-col bg-color-gray-1 p-8 rounded-md
      justify-center mt-24"
    >
      <h1 className="flex justify-center text-white/90 text-3xl font-medium">
        Sign Up
      </h1>
      <form className="mt-12 flex flex-col gap-4 w-72">
        <input
          className="px-2 py-1 rounded-md"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleInputChange}
          required
        />
        <input
          className="px-2 py-1 rounded-md"
          name="username"
          placeholder="Username"
          onChange={handleInputChange}
          required
        />
        <input
          className="px-2 py-1 rounded-md"
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleInputChange}
          required
        />
        <button
          className="mt-8 font-semibold flex justify-center items-center bg-blue-600 rounded-md px-12 w-full py-2"
          onClick={signUp}
        >
          Sign Up
        </button>
        <button
          className="text-[14px] font-medium text-white/70 transition-colors hover:text-white/80"
          onClick={() => navigate("/login")}
        >
          Already have an account? <span className='text-white/80 font-semibold'>Log In</span>
        </button>
      </form>
    </div>
  );
};

export default LogIn;
