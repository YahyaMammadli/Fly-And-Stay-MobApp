export const lightColors = {
  primary: "#1A66E8",
  primaryDark: "#1457C8",
  primarySoft: "#EAF1FC",
  background: "#F4F7FC",
  card: "#FFFFFF",
  inputBackground: "#F8FAFD",
  text: "#0F1B33",
  muted: "#7A869A",
  border: "#E3E8F0",
  error: "#E5484D",
  success: "#16A34A",
  successSoft: "#E7F6EC",
  star: "#F5B301",
  overlay: "rgba(15, 27, 51, 0.45)",
  white: "#FFFFFF",
  shadow: "0 6px 20px rgba(15, 27, 51, 0.08)",
  shadowStrong: "0 12px 32px rgba(26, 102, 232, 0.22)",
  shadowUp: "0 -6px 20px rgba(15, 27, 51, 0.06)",
  skeleton: "#E6ECF5",
};

export type ThemeColors = { [K in keyof typeof lightColors]: string };
export type ThemeMode = "light" | "dark";

export const darkColors: ThemeColors = {
  primary: "#4C8DFF",
  primaryDark: "#0E3F94",
  primarySoft: "#1A2A47",
  background: "#0B1220",
  card: "#131C2E",
  inputBackground: "#162033",
  text: "#F2F5FA",
  muted: "#8D99AE",
  border: "#243049",
  error: "#FF6B70",
  success: "#34D27B",
  successSoft: "#12301F",
  star: "#F5B301",
  overlay: "rgba(0, 0, 0, 0.6)",
  white: "#FFFFFF",
  shadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
  shadowStrong: "0 12px 32px rgba(0, 0, 0, 0.5)",
  shadowUp: "0 -6px 20px rgba(0, 0, 0, 0.4)",
  skeleton: "#1C2740",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
