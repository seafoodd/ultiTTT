import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { api } from "@/shared/api/lib/api";
import { GuestLoginResponse } from "../../types/auth/types";

/**
 * When user is unauthorized
 *
 * Uses for identify ws connection
 * @returns
 */
export function getGuestLoginOptions(
  options?: UseMutationOptions
): UseMutationOptions {
  return {
    mutationFn: () => api.post<GuestLoginResponse>("/auth/guestLogin"),
    ...options,
  };
}

export function useGuestLogin(options?: UseMutationOptions) {
  return useMutation(getGuestLoginOptions(options));
}
