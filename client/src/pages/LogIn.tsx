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

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { rateLimitTimeLeft, setRateLimitTimeLeft } = useRateLimit();

  const logIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || rateLimitTimeLeft !== null) {
      return;
    }
    setError("");
    setLoading(true);
    Axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      identifier,
      password,
      rememberMe,
    })
      .then((res) => {
        const { token } = res.data;
        cookies.set("token", token, { path: "/", sameSite: "lax", secure: true, maxAge: rememberMe ? 365 * 24 * 60 * 60 : undefined });
        setIsAuth(true);
        window.location.href = "/";
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
    return <span>Log In</span>;
  };

  return (
    <div
      className="relative flex flex-col bg-color-neutral-850 p-8 rounded-md
      justify-center mt-24 shadow-color-neutral-800 drop-shadow-lg h-fit"
    >
      <h1 className="absolute top-0 left-0 w-full text-color-accent-100 text-2xl font-medium py-2 border-b-2 border-color-accent-300">
        Log In
      </h1>
      <form className="mt-16 flex flex-col gap-4 w-72" onSubmit={logIn}>
        <input
          className="px-2 py-1.5 rounded-md bg-color-neutral-900 placeholder-color-accent-100/40"
          placeholder="Username or email"
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />
        <input
          className="px-2 py-1.5 rounded-md bg-color-neutral-900 placeholder-color-accent-100/40"
          placeholder="Password"
          type="password"
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div className="flex justify-between">
          <label className="text-[14px] cursor-pointer font-medium opacity-90 gap-1 flex items-center justify-center">
            <input
              className="cursor-pointer"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember Me
          </label>
          <button
            title="In development"
            className="text-[14px] underline font-medium opacity-80 transition-colors hover:text-white"
            type="button"
          >
            Forgot password?
          </button>
        </div>
        {error && <div className="text-red-500 text-md -mb-5">{error}</div>}
        <button
          className="bg-color-accent-400 disabled:bg-opacity-70 mt-4 font-semibold flex justify-center items-center rounded-md px-12 w-full py-2"
          disabled={loading || rateLimitTimeLeft !== null}
          type="submit"
        >
          {getButtonContent()}
        </button>
        <button
          className="text-[14px] font-medium opacity-80 transition-colors hover:opacity-90"
          onClick={() => navigate("/signup")}
        >
          Don't have an account?{" "}
          <span className="opacity-90 font-semibold">Sign Up</span>
        </button>
      </form>
    </div>
  );
};

export default LogIn;
