import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/shared/api/lib/api";
import { useAuth } from "@/shared/providers/auth-provider";

export const useGetSubscriptionStatus = () => {
  const { token } = useAuth();

  return useQuery<any, AxiosError>({
    queryKey: ["subscriptionStatus", token],
    queryFn: () =>
      api.get("/payments/subscription-status").then((res) => res.data),
  });
};
