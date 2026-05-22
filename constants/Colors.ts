import { useColorScheme } from "react-native";
const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

export default {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};

export const useAppTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    isDark,
    background: isDark ? "bg-slate-950" : "bg-slate-50",
    surface: isDark
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-slate-200",
    surfaceInverse: isDark ? "bg-white" : "bg-slate-900",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-600",
    textMuted: isDark ? "text-slate-600" : "text-slate-400",
    inputBg: isDark
      ? "bg-slate-950 border-slate-800"
      : "bg-slate-100 border-slate-200",
    accent: "bg-blue-600 border-blue-500",
    accentText: "text-blue-500",
    dangerBg: isDark
      ? "bg-red-950/40 border-red-900"
      : "bg-red-50 border-red-200",
    iconColor: isDark ? "#94A3B8" : "#64748B",
    iconInverted: isDark ? "#0F172A" : "#FFFFFF",
  };
};
