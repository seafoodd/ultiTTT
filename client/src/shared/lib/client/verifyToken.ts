import Cookies from "universal-cookie";
import axios from "axios";
import { Env } from "@/shared/constants/env";

const verifyToken = async (): Promise<boolean> => {
  const cookies = new Cookies();
  const token = cookies.get("token");

  if (!token) {
    console.error("No token found");
    return false;
  }

  try {
    const response = await axios.get(
      `${Env.VITE_API_URL}/auth/verifyToken`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};

export default verifyToken;
