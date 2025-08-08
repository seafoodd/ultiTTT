import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useNotification from "../shared/hooks/use-notification";
import LoadingCircle from "../components/LoadingCircle";
import Cookies from "universal-cookie";
import { useAuth } from "@/shared/providers/auth-provider";
import { useClientSeo } from "@/shared/hooks/use-client-seo";
import { useConfirmEmail } from "@/shared/api/mutations/auth";

const Confirmation = () => {
  useClientSeo({
    title: "Confirmation",
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const cookies = new Cookies();
  const { setIsAuth, setToken } = useAuth();

  const { mutateAsync: confirmEmail, error: confirmEmailError, isPending } =
    useConfirmEmail();

  useEffect(() => {
    if (!token || isPending) return;

    confirmEmail(token)
      .then((res) => {
        showSuccess(res.data.message);
        const token = res.data.token;
        cookies.set("token", token, {
          path: "/",
          sameSite: "lax",
          secure: true,
          maxAge: 365 * 24 * 60 * 60,
        });
        setIsAuth(true);
        setToken(token);
        navigate("/");
      })
  }, []);

  useEffect(() => {
    if(confirmEmailError){
      showError(confirmEmailError.response?.data?.message ?? "Internal Server Error")
    }
  }, [confirmEmailError]);

  return <LoadingCircle />;
};

export default Confirmation;
