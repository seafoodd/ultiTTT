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

const cookies = new Cookies();
const token = cookies.get("token");

if (!token) {
  console.error("No token found");
}

const apiUrl = import.meta.env.VITE_API_URL;
const socketUrl = apiUrl.endsWith('/api') ? `${apiUrl.replace('/api', '')}` : `${apiUrl}`;

const socket = io(socketUrl, {
  auth: {
    token: token,
  },
  path: "/sockets/socket.io",
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
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
if (rootElement) {
  createRoot(rootElement).render(
    // <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
    // </StrictMode>,
  );
}
