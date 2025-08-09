import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  SetStateAction,
} from "react";
import Cookies from "universal-cookie";
import { useGetAccount } from "@/shared/api/queries/account";
import { useGuestLogin } from "@/shared/api/mutations/auth";
import { AUTH_COOKIE } from "@/shared/constants/cookies";
import { queryClient } from "@/shared/providers/query-client-provider";

interface AuthContextType {
  authLoading: boolean;
  isAuth: boolean;
  token: string | null;
  logOut: () => void;
  setIsAuth: React.Dispatch<SetStateAction<boolean>>;
  setToken: React.Dispatch<SetStateAction<string | null>>;
  currentUser: User;
}

interface User {
  role: "user" | "guest";
  username: string;
  identifier?: string;
  email: string;
  displayName: string;
  supporter: boolean;
}

interface AuthProviderType {
  children: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderType> = ({ children }) => {
  const cookies = new Cookies();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(cookies.get("token"));
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { mutateAsync: guestLogin, error: guestLoginError } = useGuestLogin();
  const { data: account, isSuccess, isError, error, isLoading } = useGetAccount(token);

  const logOut = () => {
    cookies.remove("token", { path: "/" });
    cookies.remove("userId");
    cookies.remove("username");
    cookies.remove("hashedPassword");
    setIsAuth(false);
    setCurrentUser(null);
    queryClient.clear();
  };

  useEffect(() => {
    const loginAsGuest = async () => {
      if (token) return;

      const response = await guestLogin();
      if (guestLoginError) {
        logOut();
      }

      const newToken = response.data.token;
      cookies.set(AUTH_COOKIE, newToken, {
        path: "/",
        sameSite: "lax",
        secure: true,
        maxAge: 24 * 60 * 60,
      });
      setToken(newToken);
    };

    loginAsGuest();
  }, [token]);

  useEffect(() => {
    if (!token || isLoading) return;
    if (isLoading) setCurrentUser(null);

    if (isSuccess && account) {
      setCurrentUser(account);
      if (account.role !== "guest") {
        setIsAuth(true);
      }
      setAuthLoading(false);
    }

    if (isError) {
      if ((error as any)?.response?.status === 403) {
        logOut();
      }
      setIsAuth(false);
      setAuthLoading(false);
    }
  }, [isSuccess, isError, account, error]);

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        isAuth,
        token,
        logOut,
        setIsAuth,
        setToken,
        currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
