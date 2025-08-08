import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/lib/api";
import { AxiosError, AxiosResponse } from "axios";
import { queryClient } from "@/shared/providers/query-client-provider";

export const useCancelSubscription = () => {
  return useMutation<AxiosResponse, Error, void>({
    mutationFn: () => api.post("/payments/cancel-subscription"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
};

export const useResumeSubscription = () => {
  return useMutation<AxiosResponse, Error, void>({
    mutationFn: () => api.post("/payments/resume-subscription"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
};

export const useCreateCheckoutSession = () => {
  return useMutation<AxiosResponse, AxiosError<{ message: string }>, string>({
    mutationFn: (priceId: string) =>
      api.post("payments/checkout", { priceId }),
  });
};