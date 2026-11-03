import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Destination } from "@/api/types";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

type Props = { item: Destination; onPress: () => void };

export default function DestinationCard({ item, onPress }: Props) {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as ComponentProps<typeof Ionicons>["name"]} size={36} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={styles.body}>
        <Text style={styles.city}>{item.city}</Text>
        <Text style={styles.price}>{item.fromPrice != null ? t("From {price}", { price: formatMoney(item.fromPrice) }) : t("No flights")}</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: 120,
      borderRadius: 20,
      backgroundColor: colors.card,
      overflow: "hidden",
      boxShadow: colors.shadow,
    },
    cover: { height: 92, alignItems: "center", justifyContent: "center" },
    body: { padding: 10 },
    city: { fontSize: 13, fontWeight: "700", color: colors.text },
    price: { fontSize: 11, color: colors.muted, marginTop: 2 },
  });
