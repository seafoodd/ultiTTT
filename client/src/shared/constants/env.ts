export const ENVIRONMENTS = ["development", "production"] as const;
export type EnvType = (typeof ENVIRONMENTS)[number];

interface EnvVar {
  VITE_API_URL: string;
  VITE_API_V2_URL: string;
  VITE_ENV: EnvType;
  VITE_STRIPE_PUBLISHABLE_KEY: string;
}

export const Env: EnvVar = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_V2_URL: import.meta.env.VITE_API_V2_URL,
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
} satisfies EnvVar;
