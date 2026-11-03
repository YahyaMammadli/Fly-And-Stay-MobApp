import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width, height } = useWindowDimensions();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" bounces={false}>
        <View
          style={[
            styles.headerBackground,
            {
              height: height * 0.4,
              left: -width * 0.25,
              right: -width * 0.25,
              borderBottomLeftRadius: width,
              borderBottomRightRadius: width,
            },
          ]}
        />
        <View style={styles.circleLarge} />
        <View style={styles.circleSmall} />

        <View style={[styles.logoContainer, { height: height * 0.26 }]}>
          <View style={styles.logoBadge}>
            <Ionicons name="paper-plane" size={34} color={colors.white} />
          </View>
          <Text style={styles.brand}>Fly&Stay</Text>
          <Text style={styles.tagline}>Flights • Hotels • Your Next Trip</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </View>

        <View style={styles.footer}>{footer}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    headerBackground: { position: "absolute", top: 0, backgroundColor: colors.primary },
    circleLarge: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: "rgba(255,255,255,0.10)",
      top: -60,
      right: -50,
    },
    circleSmall: {
      position: "absolute",
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: "rgba(255,255,255,0.08)",
      top: 90,
      left: -30,
    },
    logoContainer: { alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 6 },
    logoBadge: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    brand: { color: colors.white, fontSize: 30, fontWeight: "800" },
    tagline: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 28,
      marginHorizontal: 24,
      boxShadow: colors.shadowStrong,
    },
    title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
    subtitle: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 6, marginBottom: 26 },
    footer: { alignItems: "center", marginTop: 24 },
  });
