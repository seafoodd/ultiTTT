import axios from "axios";
import { Env } from "../../constants/env";
import Cookies from "universal-cookie";
import { AUTH_COOKIE } from "@/shared/constants/cookies";

export const api = new axios.Axios({
  baseURL: Env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const cookieStore = new Cookies()
  const token = cookieStore.get(AUTH_COOKIE)

  if (token) {
    config.headers.set("authorization", `Bearer ${token}`)
  }

  return config
})
