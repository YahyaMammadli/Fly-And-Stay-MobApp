import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Flight } from "@/api/types";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { formatDuration, formatTime } from "@/utils/dates";

type Props = { flight: Flight; onSelect: () => void };

export default function FlightCard({ flight, onSelect }: Props) {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]} onPress={onSelect}>
      <View style={styles.top}>
        <View style={styles.airline}>
          <View style={[styles.logo, { backgroundColor: flight.airline.color }]}>
            <Ionicons name="airplane" size={14} color={colors.white} />
          </View>
          <Text style={styles.airlineName}>{flight.airline.name}</Text>
        </View>
        <Text style={styles.price}>{formatMoney(flight.price)}</Text>
      </View>

      <View style={styles.route}>
        <View>
          <Text style={styles.time}>{formatTime(flight.departAt)}</Text>
          <Text style={styles.code}>{flight.from.code}</Text>
        </View>
        <View style={styles.middle}>
          <Ionicons name="arrow-forward" size={16} color={colors.muted} />
          <Text style={styles.duration}>{formatDuration(flight.durationMinutes)}</Text>
          <Text style={styles.duration}>{flight.stops === 0 ? "Direct" : `1 stop · ${flight.via}`}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.time}>{formatTime(flight.arriveAt)}</Text>
          <Text style={styles.code}>{flight.to.code}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons name={flight.checkedBagIncluded ? "bag-check-outline" : "bag-handle-outline"} size={12} color={colors.muted} />
            <Text style={styles.tagText}>{flight.checkedBagIncluded ? "Bag included" : "Carry-on only"}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="airplane-outline" size={12} color={colors.muted} />
            <Text style={styles.tagText} numberOfLines={1}>
              {flight.aircraft}
            </Text>
          </View>
        </View>
        <View style={styles.select}>
          <Text style={styles.selectText}>{t("Select")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: { borderRadius: 20, padding: 16, backgroundColor: colors.card, boxShadow: colors.shadow },
    top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    airline: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
    logo: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    airlineName: { fontSize: 13, fontWeight: "700", color: colors.text },
    price: { fontSize: 20, fontWeight: "800", color: colors.text },
    route: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
    time: { fontSize: 18, fontWeight: "700", color: colors.text },
    code: { fontSize: 11, color: colors.muted, marginTop: 2 },
    middle: { alignItems: "center" },
    duration: { fontSize: 10, color: colors.muted },
    footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 8 },
    tags: { flex: 1, gap: 4 },
    tag: { flexDirection: "row", alignItems: "center", gap: 5 },
    tagText: { fontSize: 11, color: colors.muted, flexShrink: 1 },
    select: { height: 34, paddingHorizontal: 22, borderRadius: 17, backgroundColor: colors.primary, justifyContent: "center" },
    selectText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  });
