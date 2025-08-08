import { AxiosError } from "axios";
import { api } from "@/shared/api/lib/api";
import { useQuery } from "@tanstack/react-query";

type Account = {
  identifier: string;
  username: string;
  email: string;
  isSupporter: boolean;
  role: string;
};

export const useGetAccount = (token: string | null) => {
  return useQuery<Account, AxiosError>({
    queryKey: ["account", token],
    queryFn: async () => {
      const response = await api.get(`account`);
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
};
