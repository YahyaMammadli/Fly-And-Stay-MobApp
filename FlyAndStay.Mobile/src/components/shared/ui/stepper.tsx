import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = { value: number; min?: number; max?: number; onChange: (value: number) => void };

export default function Stepper({ value, min = 1, max = 9, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, value <= min && styles.off]}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        hitSlop={6}
      >
        <Ionicons name="remove" size={16} color={colors.primary} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={[styles.btn, value >= max && styles.off]}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        hitSlop={6}
      >
        <Ionicons name="add" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    btn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    off: { opacity: 0.4 },
    value: { minWidth: 14, textAlign: "center", fontSize: 14, fontWeight: "700", color: colors.text },
  });
