import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
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
import ProfileSettings from "./components/ProfileSettings";
import ChangeEmailSettings from "./components/ChangeEmailSettings";
import AppearanceSettings from "./components/AppearanceSettings";
import ChangeUsernameSettings from "./components/ChangeUsernameSettings";
import ChangePasswordSettings from "./components/ChangePasswordSettings";
import { NotificationProvider } from "./context/NotificationContext";
import Confirmation from "./pages/Confirmation";

const router = createBrowserRouter(
  [
    {
      path: "",
      element: <App />,
      children: [
        { path: "", element: <Home /> },
        { path: "/:gameId", element: <Game /> },
        { path: "/home", element: <Navigate to="/" /> },
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
        {
          path: "/confirmation",
          element: (
            <ProtectedRoute redirectTo="/" require="no-auth">
              <Confirmation />
            </ProtectedRoute>
          ),
        },
        {
          path: "/@/:username",
          element: <Profile />,
        },
        {
          path: "/settings",
          element: (
            <ProtectedRoute redirectTo={"/"} require="auth">
              <Settings />
            </ProtectedRoute>
          ),
          children: [
            { path: "", element: <ProfileSettings /> },
            { path: "profile", element: <ProfileSettings /> },
            { path: "appearance", element: <AppearanceSettings /> },
            { path: "change-password", element: <ChangePasswordSettings /> },
            { path: "change-username", element: <ChangeUsernameSettings /> },
            { path: "change-email", element: <ChangeEmailSettings /> },
          ],
        },
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
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <StoreProvider>
            <RouterProvider router={router} />
          </StoreProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>,
  );
}

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then((registration) => {
//         console.log("Service Worker Registered ✅");
//
//         registration.addEventListener("updatefound", () => {
//           const newWorker = registration.installing;
//           if (!newWorker) return;
//
//           newWorker.addEventListener("statechange", () => {
//             if (newWorker.state === "installed") {
//               if (navigator.serviceWorker.controller) {
//                 console.log("New Service Worker available — refreshing.");
//                 window.location.reload();
//               } else {
//                 console.log("Service Worker installed.");
//               }
//             }
//           });
//         });
//       })
//       .catch((err) =>
//         console.error("Service Worker Registration Failed ❌", err),
//       );
//   });
// }
