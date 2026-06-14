import { useTheme } from "next-themes";

/**
 * Shared color palette for all auth pages (AuthShell children).
 * Switches automatically between dark and light mode.
 */
export function useAuthPalette() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return {
    dark,
    heading:        dark ? "#DDE8F4"                     : "#0D1E35",
    body:           dark ? "#7AAAC8"                     : "#2C5070",
    muted:          dark ? "#4E7A9A"                     : "#4A7A9B",
    emailHighlight: dark ? "#8BAFC7"                     : "#2C5070",
    stepDone:       dark ? "#8BAFC7"                     : "#2C5070",
    inputText:      dark ? "#C8D8E8"                     : "#0D1E35",
    inputBorder:    dark ? "rgba(255,255,255,0.12)"      : "rgba(15,31,56,0.18)",
    inputBorderErr: "#F87171",
    inputBg:        dark ? "rgba(255,255,255,0.03)"      : "rgba(15,31,56,0.03)",
    oauthBorder:    dark ? "rgba(255,255,255,0.1)"       : "rgba(15,31,56,0.14)",
    oauthText:      dark ? "#6B95B8"                     : "#2C5070",
    eyeIcon:        dark ? "#7AAAC8"                     : "#4A7A9B",
    stepBorder:     dark ? "rgba(255,255,255,0.05)"      : "rgba(15,31,56,0.08)",
    stepBg:         dark ? "rgba(255,255,255,0.03)"      : "rgba(15,31,56,0.03)",
    selectText:     dark ? "#C8D8E8"                     : "#0D1E35",
    selectBorder:   dark ? "rgba(255,255,255,0.12)"      : "rgba(15,31,56,0.18)",
    backLink:       dark ? "#4E7A9A"                     : "#4A7A9B",
  };
}
