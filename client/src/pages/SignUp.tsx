import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Cookies from "universal-cookie";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";
import useRateLimit from "../hooks/useRateLimit";

const LogIn = () => {
  const { setIsAuth } = useAuth();
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const { rateLimitTimeLeft, setRateLimitTimeLeft } = useRateLimit();


  const signUp = (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || rateLimitTimeLeft !== null) {
      return;
    }
    setError("");
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    Axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
      email,
      username,
      password,
    })
      .then((res) => {
        const { token } = res.data;
        cookies.set("token", token, { path: "/" });
        setIsAuth(true);
        window.location.href = "/home";
      })
      .catch((err) => {
        if (err.response?.status === 429) {
          const retryAfter = err.response.data.retryAfter;
          setRateLimitTimeLeft(retryAfter);
        } else {
          setError(
            err.response?.data?.error || "An error occurred. Please try again",
          );
        }
        setLoading(false);
      });
  };

  const getButtonContent = () => {
    if (loading) {
      return <LoadingCircle />;
    }
    if (rateLimitTimeLeft !== null) {
      return <span>{rateLimitTimeLeft}</span>;
    }
    return <span>Sign Up</span>;
  };

  return (
    <div
      className="flex flex-col bg-color-gray-1 p-8 rounded-md
      justify-center mt-24"
    >
      <h1 className="flex justify-center text-white/90 text-3xl font-medium">
        Sign Up
      </h1>
      <form className="mt-12 flex flex-col gap-4 w-72" onSubmit={signUp}>
        <input
          className="px-2 py-1 rounded-md"
          name="email"
          type="email"
          minLength={3}
          placeholder="Email"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="px-2 py-1 rounded-md"
          name="username"
          minLength={2}
          placeholder="Username"
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          className="px-2 py-1 rounded-md"
          name="password"
          placeholder="Password"
          type="password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <input
          className="px-2 py-1 rounded-md"
          name="passwordConfirm"
          placeholder="Confirm Password"
          type="password"
          onChange={(event) => setPasswordConfirm(event.target.value)}
          required
        />
        {error && <div className="text-red-500 text-md -mb-5">{error}</div>}
        <button
          className="bg-blue-600 disabled:bg-opacity-70 mt-8 font-semibold flex justify-center items-center rounded-md px-12 w-full py-2"
          disabled={loading || rateLimitTimeLeft !== null}
          type="submit"
        >
          {getButtonContent()}
        </button>
        <button
          className="text-[14px] font-medium text-white/70 transition-colors hover:text-white/80"
          onClick={() => navigate("/login")}
        >
          Already have an account?{" "}
          <span className="text-white/80 font-semibold">Log In</span>
        </button>
      </form>
    </div>
  );
};

export default LogIn;
