import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];

  dropdown?: boolean;

  removable?: boolean;
};

export default function Chip({ label, active, onPress, icon, dropdown, removable }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tint = active ? colors.white : colors.text;

  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]}>
      {icon && <Ionicons name={icon} size={14} color={tint} />}
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
      {dropdown && <Ionicons name="chevron-down" size={12} color={active ? colors.white : colors.muted} />}
      {removable && <Ionicons name="close" size={14} color={active ? colors.white : colors.muted} />}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
    },
    active: { backgroundColor: colors.primary, borderColor: colors.primary },
    label: { fontSize: 13, fontWeight: "600" },
  });
