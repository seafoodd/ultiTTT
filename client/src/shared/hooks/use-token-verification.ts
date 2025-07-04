import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import axios from "axios";

const useTokenVerification = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/account`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (response.status === 200) {
          setIsAuth(true);
        }
      } catch (error) {
        setIsAuth(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return isAuth;
};

export default useTokenVerification;
