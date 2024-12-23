import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  SetStateAction,
} from "react";
import Cookies from "universal-cookie";
import axios from "axios";

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
  const token = cookies.get("token");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/verifyToken`,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          if (response.status === 200) {
            setIsAuth(true);
            setCurrentUser(response.data.user);
          }
        } catch (error) {
          setIsAuth(false);
          setCurrentUser({username: "guest"});
        }
      }
      else{
        setCurrentUser({ username: "guest" });
      }
      setAuthLoading(false);
    })();
  }, [token]);

  const logOut = () => {
    cookies.remove("token", {path: "/" });
    cookies.remove("userId");
    cookies.remove("username");
    cookies.remove("hashedPassword");
    setIsAuth(false);

    window.location.href = "/home";
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
