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
  const token = cookies.get("token");
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const verifyToken = async () => {
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
          setCurrentUser(response.data.user)
        }
      } catch (error) {
        // console.log("verify token error:", error)
        setIsAuth(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const logOut = () => {
    cookies.remove("token");
    cookies.remove("userId");
    cookies.remove("username");
    cookies.remove("hashedPassword");
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isAuth, token, logOut, setIsAuth, currentUser }}>
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
