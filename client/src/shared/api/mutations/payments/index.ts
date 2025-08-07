import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/lib/api";
import { AxiosError, AxiosResponse } from "axios";

export const useCancelSubscription = () => {
  return useMutation<AxiosResponse, Error, void>({
    mutationFn: () => api.post("/payments/cancel-subscription"),
  });
};

export const useResumeSubscription = () => {
  return useMutation<AxiosResponse, Error, void>({
    mutationFn: () => api.post("/payments/resume-subscription"),
  });
};

export const useCreateCheckoutSession = () => {
  return useMutation<AxiosResponse, AxiosError<{ message: string }>, string>({
    mutationFn: (priceId: string) =>
      api.post("payments/checkout", { priceId }),
  });
};