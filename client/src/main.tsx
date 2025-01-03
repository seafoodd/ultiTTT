import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import About from "./pages/About";
import Learn from "./pages/Learn";
import Donate from "./pages/Donate";
import Game from "./components/Game";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import { Root } from "react-dom/client";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";
import { StoreProvider } from "./context/StoreContext";

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
        { path: "/learn", element: <Learn /> },
        { path: "/donate", element: <Donate /> },
        {
          path: "/friends",
          element: (
            <ProtectedRoute redirectTo={"/"} require="auth">
              <Friends />
            </ProtectedRoute>
          ),
        },
        {
          path: "/login",
          element: (
            <ProtectedRoute redirectTo="/" require="no-auth">
              <LogIn />
            </ProtectedRoute>
          ),
        },
        {
          path: "/signup",
          element: (
            <ProtectedRoute redirectTo="/" require="no-auth">
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
    <SocketProvider>
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
        </StoreProvider>
      </AuthProvider>
    </SocketProvider>,
  );
}
