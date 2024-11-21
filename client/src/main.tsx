import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Rules from "./pages/Rules";
import Donate from "./pages/Donate";
import Game from "./components/Game";
import { io } from "socket.io-client";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Cookies from "universal-cookie";
import Settings from "./pages/Settings";
import { debugError } from "./utils/debugUtils";
import { Root } from "react-dom/client";

export const env = import.meta.env.VITE_ENV || "production";

const cookies = new Cookies();
const token = cookies.get("token");

const apiUrl = import.meta.env.VITE_API_URL;
const socketUrl = apiUrl.endsWith("/api")
  ? `${apiUrl.replace("/api", "")}`
  : `${apiUrl}`;

const socket = io(socketUrl, {
  auth: {
    token: token,
  },
  path: env === "production" ? "/sockets/socket.io" : undefined,
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

socket.on("error", (err) => {
  debugError(err.code, err.message);
});

const router = createBrowserRouter(
  [
    {
      path: "",
      element: <App socket={socket} />,
      children: [
        { path: "", element: <Home socket={socket} /> },
        { path: "/:gameId", element: <Game socket={socket} /> },
        { path: "/home", element: <Home socket={socket} /> },
        { path: "/about", element: <About /> },
        { path: "/blog", element: <Blog /> },
        { path: "/rules", element: <Rules /> },
        { path: "/donate", element: <Donate /> },
        { path: "/friends", element: <Friends /> },
        { path: "/login", element: <LogIn /> },
        { path: "/signup", element: <SignUp /> },
        { path: "/@/:username", element: <Profile socket={socket} /> },
        { path: "/settings", element: <Settings /> },
      ],
    },
  ],
  {
    basename: "/",
  },
);

const rootElement = document.getElementById("root");
let root: Root;

if (rootElement) {
  if (!(rootElement as any)._reactRootContainer) {
    root = createRoot(rootElement);
    (rootElement as any)._reactRootContainer = root;
  } else {
    root = (rootElement as any)._reactRootContainer;
  }

  root.render(
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>,
  );
}