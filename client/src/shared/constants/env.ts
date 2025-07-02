import { LiteralEnum } from "../lib/types/literal-enum"

export const EnvType = {
  Dev: "development",
  Prod: "production"
}

export type EnvType = LiteralEnum<typeof EnvType>

interface EnvVar {
  VITE_API_URL: string
  VITE_ENV: EnvType
}

export const Env = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_ENV: import.meta.env.VITE_ENV
} satisfies EnvVar
