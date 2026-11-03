import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";

import { THEME_STORAGE_KEY } from "@/constants/storage";
import { darkColors, lightColors, ThemeColors, ThemeMode, ThemePreference } from "@/constants/theme";

// Automatic theme: dark from 19:00, light from 07:00 (device local time).
const DARK_FROM_HOUR = 19;
const LIGHT_FROM_HOUR = 7;

type ThemeContextValue = {
  mode: ThemeMode;
  preference: ThemePreference;
  isDark: boolean;
  colors: ThemeColors;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function modeForTime(date: Date): ThemeMode {
  const hour = date.getHours();
  return hour >= DARK_FROM_HOUR || hour < LIGHT_FROM_HOUR ? "dark" : "light";
}

function msUntilNextSwitch(now: Date): number {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  const hour = now.getHours();
  if (hour < LIGHT_FROM_HOUR) next.setHours(LIGHT_FROM_HOUR);
  else if (hour < DARK_FROM_HOUR) next.setHours(DARK_FROM_HOUR);
  else {
    next.setDate(next.getDate() + 1);
    next.setHours(LIGHT_FROM_HOUR);
  }
  return next.getTime() - now.getTime() + 1000;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [autoMode, setAutoMode] = useState<ThemeMode>(() => modeForTime(new Date()));

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === "auto" || saved === "light" || saved === "dark") setPreferenceState(saved);
    });
  }, []);

  useEffect(() => {
    if (preference !== "auto") return;

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const now = new Date();
      setAutoMode(modeForTime(now));
      clearTimeout(timer);
      timer = setTimeout(schedule, msUntilNextSwitch(now));
    };
    schedule();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") schedule();
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [preference]);

  const mode: ThemeMode = preference === "auto" ? autoMode : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(mode === "dark" ? "light" : "dark");
  }, [mode, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      isDark: mode === "dark",
      colors: mode === "dark" ? darkColors : lightColors,
      setPreference,
      toggleTheme,
    }),
    [mode, preference, setPreference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
