import { useColorScheme } from "react-native";
import { buildNativeTheme } from "@workspace/design-tokens/native";

/**
 * Returns the full TIL design theme for the current color scheme.
 * Source of truth: lib/design-tokens/src/tokens.ts
 * Change any value there → this hook updates instantly.
 */
export function useColors() {
  useColorScheme();
  return buildNativeTheme(true);
}

export type AppColors = ReturnType<typeof useColors>["colors"];
export type AppTheme  = ReturnType<typeof useColors>;
