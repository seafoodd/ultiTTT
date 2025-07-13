import React, { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";
import useRateLimit from "../shared/hooks/use-rate-limit";
import { useClientSeo } from "@/shared/hooks/use-client-seo";
import { Env } from "@/shared/constants/env";
import { cn } from "@/shared/lib/client/cn";

const LogIn = () => {
  useClientSeo({
    title: "Sign up - ultiTTT",
  });

  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const { rateLimitTimeLeft, setRateLimitTimeLeft } = useRateLimit();
  const [emailConfirmationWindow, setEmailConfirmationWindow] =
    useState<boolean>(false);

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
    Axios.post(`${Env.VITE_API_V2_URL}/auth/register`, {
      email,
      username,
      password,
    })
      .then(() => {
        setEmailConfirmationWindow(true);
        setRateLimitTimeLeft(60);
      })
      .catch((err) => {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"];
          setRateLimitTimeLeft(retryAfter);
          setError('Too many registration attempts');
        } else {
          const msg = Array.isArray(err.response?.data?.message)
            ? err.response.data.message[0]
            : err.response?.data?.message || "An error occurred. Please try again";

          setError(msg);
        }
        setLoading(false);
      });
  };

  const resendVerificationEmail = () => {
    Axios.post(`${Env.VITE_API_V2_URL}/auth/resend-verification-email`, {
      email,
    })
      .then(() => {
        setRateLimitTimeLeft(60);
        console.log("Resend verification email");
      })
      .catch((err) => {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers["retry-after"];
          setRateLimitTimeLeft(retryAfter);
        } else {
          setError(
            err.response.data.message || "An error occurred. Please try again",
          );
        }
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

  if (emailConfirmationWindow) {
    return (
      <div
        className="relative flex flex-col bg-color-neutral-850 p-8 sm:rounded-md
         mt-24 shadow-color-neutral-800 drop-shadow-lg h-fit max-w-[480px]"
      >
        <h2 className="text-white text-center text-2xl font-semibold mb-6">
          Please confirm your email
        </h2>
        <p className="text-gray-300 text-center mb-6 font-normal text-lg">
          We’ve sent a confirmation email to your inbox. Please click the link
          in the email to verify your account and complete the registration
          process.
        </p>
        <p className="text-gray-300 text-center font-normal text-lg">
          If you haven't received the email, please check your spam folder, or{" "}
          <button
            onClick={resendVerificationEmail}
            disabled={rateLimitTimeLeft !== null}
            className={cn(
              "text-blue-400",
              rateLimitTimeLeft === null && "hover:underline",
            )}
          >
            request a new one{" "}
            <span hidden={rateLimitTimeLeft === null}>
              after {rateLimitTimeLeft} seconds
            </span>
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col bg-color-neutral-850 p-8 rounded-md
      justify-center mt-24 shadow-color-neutral-800 drop-shadow-lg h-fit"
    >
      <h1 className="absolute top-0 left-0 w-full text-color-accent-100 text-2xl font-medium py-2 border-b-2 border-color-accent-300">
        Sign Up
      </h1>
      <form className="mt-16 flex flex-col gap-4 w-72" onSubmit={signUp}>
        <input
          className="px-2 py-1.5 rounded-md bg-color-neutral-900 placeholder-color-accent-100/40"
          name="email"
          type="email"
          minLength={3}
          placeholder="Email"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="px-2 py-1.5 rounded-md bg-color-neutral-900 placeholder-color-accent-100/40"
          name="username"
          minLength={2}
          placeholder="Username"
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          className="px-2 py-1.5 rounded-md bg-color-neutral-900 placeholder-color-accent-100/40"
          name="password"
          placeholder="Password"
          type="password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <input
          className="px-2 py-1.5 rounded-md bg-color-neutral-900 placeholder-color-accent-100/40"
          name="passwordConfirm"
          placeholder="Confirm Password"
          type="password"
          onChange={(event) => setPasswordConfirm(event.target.value)}
          required
        />
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
          onClick={() => navigate("/login")}
        >
          Already have an account?{" "}
          <span className="opacity-90 font-semibold">Log In</span>
        </button>
      </form>
    </div>
  );
};

export default LogIn;
