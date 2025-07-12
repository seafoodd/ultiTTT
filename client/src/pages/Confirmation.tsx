import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Axios from "axios";
import useNotification from "../shared/hooks/use-notification";
import LoadingCircle from "../components/LoadingCircle";
import Cookies from "universal-cookie";
import { useAuth } from "@/shared/provider/auth-provider";
import { useClientSeo } from "@/shared/hooks/use-client-seo";
import { Env } from "@/shared/constants/env";

const Confirmation = () => {
  useClientSeo({
    title: "Confirmation - ultiTTT",
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const cookies = new Cookies();
  const { setIsAuth } = useAuth();

  useEffect(() => {
    if (!token) return;

    Axios.post(
      `${Env.VITE_API_URL}/auth/confirm-email`,
      {},
      {
        headers: {
          Authorization: token,
        },
      },
    )
      .then((res) => {
        showSuccess(res.data.message);
        cookies.set("token", res.data.token, {
          path: "/",
          sameSite: "lax",
          secure: true,
          maxAge: 365 * 24 * 60 * 60,
        });
        setIsAuth(true);
        navigate("/");
      })
      .catch((e) => {
        showError(e.response.data.error);
        navigate("/");
      });
  }, [token]);

  return <LoadingCircle />;
};

export default Confirmation;
