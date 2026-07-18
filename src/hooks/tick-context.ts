import { createContext, useContext } from "react";

export const TickContext = createContext(0);

export function useTick(): number {
  return useContext(TickContext);
}
