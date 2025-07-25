import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Learn from "./pages/Learn";
import Donate from "./pages/Donate";
import Game from "./components/Game";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import { Root } from "react-dom/client";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { WebsocketSocketProvider } from "./shared/provider/websocket-provider";
import { StoreProvider } from "./shared/provider/store-provider";
import ProfileSettings from "./components/account/ProfileSettings";
import ChangeEmailSettings from "./components/account/ChangeEmailSettings";
import AppearanceSettings from "./components/account/AppearanceSettings";
import ChangeUsernameSettings from "./components/account/ChangeUsernameSettings";
import ChangePasswordSettings from "./components/account/ChangePasswordSettings";
import { NotificationProvider } from "./shared/provider/notification-provider";
import Confirmation from "./pages/Confirmation";
import { AuthProvider } from "./shared/provider/auth-provider";
import { LayoutWithFooter } from "@/components/layout/LayoutWithFooter";
import { LayoutWithoutFooter } from "@/components/layout/LayoutWithoutFooter";

const router = createBrowserRouter(
  [
    {
      element: <LayoutWithFooter />,
      children: [
        { path: "", element: <Home /> },
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
    {
      element: <LayoutWithoutFooter />,
      children: [{ path: "/:gameId", element: <Game /> }],
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
      <WebsocketSocketProvider>
        <NotificationProvider>
          <StoreProvider>
            <RouterProvider router={router} />
          </StoreProvider>
        </NotificationProvider>
      </WebsocketSocketProvider>
    </AuthProvider>,
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker Registered ✅");

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("New Service Worker available — refreshing.");
                window.location.reload();
              } else {
                console.log("Service Worker installed.");
              }
            }
          });
        });
      })
      .catch((err) =>
        console.error("Service Worker Registration Failed ❌", err),
      );
  });
}
