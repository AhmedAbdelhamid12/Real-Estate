import { buildNativeTheme } from "@workspace/design-tokens/native";
import { useAppTheme } from "@/contexts/ThemeContext";

/**
 * Returns the full TIL design theme for the current color scheme.
 * Source of truth: lib/design-tokens/src/tokens.ts
 * Respects user's dark/light preference stored in AsyncStorage.
 */
export function useColors() {
  const { isDark } = useAppTheme();
  return buildNativeTheme(isDark);
}

export type AppColors = ReturnType<typeof useColors>["colors"];
export type AppTheme  = ReturnType<typeof useColors>;
