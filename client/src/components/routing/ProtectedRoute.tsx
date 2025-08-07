import React from "react";
import { Navigate } from "react-router-dom";
import LoadingCircle from "../LoadingCircle";
import { useAuth } from "@/shared/providers/auth-provider";

export const ProtectedRouteRequiredType = {
  Auth: "auth",
  NoAuth: "no-auth",
} as const;

export type ProtectedRouteRequiredType = typeof ProtectedRouteRequiredType[keyof typeof ProtectedRouteRequiredType];

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo: string;
  require: ProtectedRouteRequiredType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo,
  require,
}) => {
  const { isAuth, authLoading } = useAuth();

  if (authLoading) {
    return <LoadingCircle />;
  }

  if (require === "no-auth" && isAuth) {
    return <Navigate to={redirectTo} />;
  }
  if (require === "auth" && !isAuth) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
