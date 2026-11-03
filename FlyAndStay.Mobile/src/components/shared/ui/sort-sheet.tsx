import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import Sheet from "@/components/shared/ui/sheet";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  visible: boolean;
  options: Option<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export default function SortSheet<T extends string>({ visible, options, value, onSelect, onClose }: Props<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Sheet visible={visible} title="Sort by" onClose={onClose}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={styles.row}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
            {active && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: { fontSize: 15, color: colors.text },
    labelActive: { color: colors.primary, fontWeight: "700" },
  });
