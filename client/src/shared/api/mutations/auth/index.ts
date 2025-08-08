import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "@/shared/api/lib/api";

export const useGuestLogin = () => {
  return useMutation<AxiosResponse, AxiosError<{ message: string }>, void>({
    mutationFn: () => api.post("auth/guest-login"),
  });
};

export const useConfirmEmail = () => {
  return useMutation<AxiosResponse, AxiosError<{ message: string }>, string>({
    mutationFn: (token: string) =>
      api.post(
        "auth/confirm-email",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    retry: false,
  });
};
