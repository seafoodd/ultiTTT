import React from "react";
import { Navigate } from "react-router-dom";
import LoadingCircle from "../LoadingCircle";
import { useAuth } from "@/shared/provider/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo: string;
  require: "auth" | "no-auth";
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
