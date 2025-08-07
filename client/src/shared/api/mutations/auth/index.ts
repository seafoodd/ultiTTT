import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { api } from "@/shared/api/lib/api";

export const useGuestLogin = () => {
  return useMutation<AxiosResponse, AxiosError<{ message: string }>, void>({
    mutationFn: () =>
      api.post("auth/guest-login"),
  });
};