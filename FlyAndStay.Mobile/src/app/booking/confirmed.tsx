import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/shared/ui/button";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

export default function BookingConfirmedScreen() {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { reference, total } = useLocalSearchParams<{ reference?: string; total?: string }>();

  const share = () => {
    Share.share({ message: `My Fly&Stay booking reference: ${reference}` }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={44} color={colors.white} />
        </View>
        <Text style={styles.title}>{t("Booking Confirmed!")}</Text>
        <Text style={styles.sub}>{t("Your trip is all set.")}</Text>
        {!!total && <Text style={styles.total}>{t("Total paid: {price}", { price: formatMoney(Number(total)) })}</Text>}

        <View style={styles.refBox}>
          <View>
            <Text style={styles.refLabel}>{t("Booking Reference")}</Text>
            <Text style={styles.refValue}>#{reference}</Text>
          </View>
          <Pressable onPress={share} hitSlop={10}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button title={t("View My Trips")} onPress={() => router.replace("/trips")} />
          <Button title={t("Back to Home")} variant="outline" onPress={() => router.replace("/home")} />
        </View>
      </View>

      <View style={styles.skyline}>
        <Ionicons name="business" size={44} color={colors.primary} style={{ opacity: 0.35 }} />
        <Ionicons name="airplane" size={30} color={colors.primary} style={{ opacity: 0.5, marginBottom: 30 }} />
        <Ionicons name="business" size={64} color={colors.primary} style={{ opacity: 0.25 }} />
        <Ionicons name="business" size={36} color={colors.primary} style={{ opacity: 0.35 }} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    check: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 20 },
    sub: { fontSize: 13, color: colors.muted, marginTop: 6 },
    total: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 6 },
    refBox: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      marginTop: 24,
      backgroundColor: colors.card,
    },
    refLabel: { fontSize: 11, color: colors.muted },
    refValue: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 2 },
    actions: { width: "100%", gap: 12, marginTop: 24 },
    skyline: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 18, paddingBottom: 8, backgroundColor: colors.primarySoft, height: 110 },
  });
