import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export default function Index() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (splashDone && !loading && user) router.replace("/home");
  }, [splashDone, loading, user, router]);

  const ready = splashDone && !loading && !user;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.cloud, { bottom: 140, left: -60, width: 260, height: 260 }]} />
      <View style={[styles.cloud, { bottom: 60, right: -80, width: 300, height: 300 }]} />
      <View style={[styles.cloud, { bottom: -80, left: 40, width: 280, height: 280 }]} />

      <View style={styles.logoBlock}>
        <Ionicons name="paper-plane" size={84} color={colors.white} />
        <Text style={styles.brand}>Fly&Stay</Text>
        <Text style={styles.tagline}>Flights • Hotels • Your Next Trip</Text>
      </View>

      {ready && (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={() => router.push("/auth/sign-up")}
          >
            <Text style={styles.primaryText}>Get Started</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/auth/sign-in")} hitSlop={10}>
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    overflow: "hidden",
  },
  cloud: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  logoBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  brand: { color: colors.white, fontSize: 40, fontWeight: "800" },
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  actions: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 64,
    alignItems: "center",
    gap: 20,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  primaryText: { color: "#0F1B33", fontSize: 16, fontWeight: "700" },
  loginText: { color: colors.white, fontSize: 15, fontWeight: "500" },
});
