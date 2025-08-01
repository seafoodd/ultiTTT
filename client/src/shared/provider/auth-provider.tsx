import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  SetStateAction,
} from "react";
import Cookies from "universal-cookie";
import axios from "axios";
import { Env } from "@/shared/constants/env";

interface AuthContextType {
  authLoading: boolean;
  isAuth: boolean;
  token: string | null;
  logOut: () => void;
  setIsAuth: React.Dispatch<SetStateAction<boolean>>;
  currentUser: any;
}

interface AuthProviderType {
  children: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderType> = ({ children }) => {
  const cookies = new Cookies();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  let token = cookies.get("token");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!token) {
        try {
          const response = await axios.post(
            `${Env.VITE_API_V2_URL}/auth/guest-login`,
          );
          console.log("AAAAAAAA", response);
          if (response.status === 201) {
            token = response.data.token;
            cookies.set("token", token, {
              path: "/",
              sameSite: "lax",
              secure: true,
            });
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 403) {
            logOut();
          }
          setIsAuth(false);
        }
      }
      try {
        const response = await axios.get(`${Env.VITE_API_URL}/account`, {
          headers: {
            Authorization: token,
          },
        });
        if (response.status === 200) {
          setCurrentUser(response.data);
          if (response.data.role !== "guest") {
            setIsAuth(true);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          logOut();
        }
        setIsAuth(false);
      }
      setAuthLoading(false);
    })();
  }, [token]);

  const logOut = () => {
    cookies.remove("token", { path: "/" });
    cookies.remove("userId");
    cookies.remove("username");
    cookies.remove("hashedPassword");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{ authLoading, isAuth, token, logOut, setIsAuth, currentUser }}
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
