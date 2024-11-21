import { env } from "../main";

const debugWrapper = (fn: (...args: any[]) => void) => {
  return (...args: any[]) => {
    if (env !== "development") return;
    fn(...args);
  };
};

export const debugLog = debugWrapper((message: any) => {
  console.log(message);
});

export const debugError = debugWrapper((code:number, message: string ) => {
  console.error(code, message);
});