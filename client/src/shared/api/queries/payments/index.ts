import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/shared/api/lib/api";

export const useGetSubscriptionStatus = () => {
  return useQuery<any, AxiosError>({
    queryKey: ["subscriptionStatus"],
    queryFn: () =>
      api.get("/payments/subscription-status").then((res) => res.data),
  });
};
