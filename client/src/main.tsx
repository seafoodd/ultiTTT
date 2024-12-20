// import { StrictMode } from "react";
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
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import { Root } from "react-dom/client";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";

const router = createBrowserRouter(
  [
    {
      path: "",
      element: <App />,
      children: [
        { path: "", element: <Home /> },
        { path: "/:gameId", element: <Game /> },
        { path: "/home", element: <Home /> },
        { path: "/about", element: <About /> },
        { path: "/blog", element: <Blog /> },
        { path: "/rules", element: <Rules /> },
        { path: "/donate", element: <Donate /> },
        { path: "/friends", element: <Friends /> },
        {
          path: "/login",
          element: (
            <ProtectedRoute redirectTo="/home">
              <LogIn />
            </ProtectedRoute>
          ),
        },
        {
          path: "/signup",
          element: (
            <ProtectedRoute redirectTo="/home">
              <SignUp />
            </ProtectedRoute>
          ),
        },
        { path: "/@/:username", element: <Profile /> },
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
    // <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </AuthProvider>,
    // </StrictMode>,
  );
}
