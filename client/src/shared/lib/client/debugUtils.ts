import { Env } from "../../constants/env";

const debugWrapper = (fn: (...args: any[]) => void) => {
  return (...args: any[]) => {
    if (Env.VITE_ENV !== "development") return;
    fn(...args);
  };
};

export const debugLog = debugWrapper((message: any) => {
  console.log(message);
});

export const debugError = debugWrapper((code: number, message: string) => {
  console.error(code, message);
});
