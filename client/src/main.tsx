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
import {io, Socket} from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_API_URL);

const router = createBrowserRouter(
  [
    {
      path: "",
      element: <App />,
      children: [
        { path: "", element: <Home /> },
        { path: "/:gameId", element: <Game socket={socket}/> },
        { path: "/home", element: <Home /> },
        { path: "/about", element: <About /> },
        { path: "/blog", element: <Blog /> },
        { path: "/rules", element: <Rules /> },
        { path: "/donate", element: <Donate /> },
        { path: "/friends", element: <Friends /> },
        { path: "/@/:username", element: <Profile /> },
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
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>,
  );
}
