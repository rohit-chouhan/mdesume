import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe, type ResolvedTheme } from "@/lib/theme";

/** Subscribe a React island to the light/dark preference without hydration flash. */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}
